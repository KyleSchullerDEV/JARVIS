import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText, StreamData } from "ai";
import { getSystemInfo } from "./systemInfo";
import { tools } from "./tools";
import path from "path";
import { app } from "electron";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../../.env") });

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in the environment variables");
  app.quit();
}

const getSystemPrompt = (): string => {
  const { osName, platform, homedir, desktopPath, documentsPath } = getSystemInfo();
  const currentDateTime = new Date().toLocaleString();

  return `
<<<SESSION_CONTEXT>>>
Current date: ${currentDateTime}

System Information:
- OS: ${osName}
- Platform: ${platform}
- Home Directory: ${homedir}
- Desktop Path: ${desktopPath}
- Documents Path: ${documentsPath}

// Consider this info when executing commands (e.g., 'dir' for Windows, 'ls' for macOS/Linux)
<<</SESSION_CONTEXT>>>

I am JARVIS, an AI copilot resident in an Electron desktop app on the user's machine.

I plan my actions, execute them step-by-step and keep the user in the loop between long running tasks. I will be resilient, adapting my stragegies based on the tool results to ensure the user's goals are met.

After complex tasks I will self reflect on my tool use and response, recusrively correcting discrepancies and recovering from mistakes.
`;
};

export function createHttpServer(onServerStarted: (port: number) => void): FastifyInstance {
  const fastify = Fastify({
    logger: true,
  });

  fastify.register(cors, {
    origin: true,
  });

  fastify.post("/api/chat", async (request, reply) => {
    try {
      const { messages, attachments } = request.body as { messages: any[]; attachments?: any[] };

      const data = new StreamData();

      const result = await streamText({
        model: openai("gpt-4o"),
        system: getSystemPrompt(),
        messages: convertToCoreMessages(messages),
        tools,
        maxToolRoundtrips: 20,
        experimental_toolCallStreaming: true,
        temperature: 0.7,
        maxRetries: 3,
        attachments,
        onToolCall: async ({ toolCall }) => {
          try {
            data.append({ type: "toolCall", value: toolCall });
          } catch (error) {
            console.error("Error in onToolCall:", error);
          }
        },
        onFinish: ({ usage }) => {
          try {
            data.append({ type: "usage", value: usage });
            data.close();
          } catch (error) {
            console.error("Error in onFinish:", error);
          }
        },
      });

      return result.toDataStreamResponse({ 
        data,
        getErrorMessage: (error) => {
          console.error("Stream error:", error);
          return error instanceof Error ? error.message : String(error);
        }
      });
    } catch (error) {
      console.error("Error in /api/chat:", error);
      reply.status(500).send({ error: "An error occurred while processing your request.", details: error instanceof Error ? error.message : String(error) });
    }
  });

  const start = async () => {
    try {
      const address = await fastify.listen({ port: 0 });
      fastify.log.info(`HTTP Server running on ${address}`);
      const port = (fastify.server.address() as any).port;
      onServerStarted(port);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };

  start();

  return fastify;
}