import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText, StreamData } from 'ai';
import { getSystemPrompt } from './getSystemPrompt';
import { readFromFile, writeToFile, executeCommand } from './tools';

const tools = {
  readFromFile,
  writeToFile,
  executeCommand,
};

export function createHttpServer(
  onServerStarted: (port: number) => void
): FastifyInstance {
  const fastify = Fastify({
    logger: true,
  });

  fastify.register(cors, {
    origin: true,
  });

  fastify.post('/api/chat', async (request, reply) => {
    try {
      const { messages } = request.body as {
        messages: any[];
      };

      const data = new StreamData();

      const result = await streamText({
        model: openai(process.env.OPENAI_API_MODEL),
        system: getSystemPrompt(),
        messages: convertToCoreMessages(messages),
        tools,
        maxToolRoundtrips: parseInt(process.env.MAX_TOOL_ROUND_TRIPS),
        experimental_toolCallStreaming: true,
        temperature: parseFloat(process.env.TEMPERATURE),
        maxRetries: 3,
        onToolCall: async ({ toolCall }) => {
          try {
            // Ensure the correct tool name is being used
            const toolName = Object.keys(tools).find(
              (key) => tools[key] === toolCall.tool
            );
            data.append({
              type: 'toolCall',
              value: {
                ...toolCall,
                toolName: toolName || toolCall.toolName,
              },
            });
          } catch (error) {
            console.error('Error in onToolCall:', error);
          }
        },
        onFinish: ({ usage }) => {
          try {
            data.append({ type: 'usage', value: usage });
            data.close();
          } catch (error) {
            console.error('Error in onFinish:', error);
          }
        },
      });

      return result.toDataStreamResponse({
        data,
        getErrorMessage: (error) => {
          console.error('Stream error:', error);
          return error instanceof Error ? error.message : String(error);
        },
      });
    } catch (error) {
      console.error('Error in /api/chat:', error);
      reply.status(500).send({
        error: 'An error occurred while processing your request.',
        details: error instanceof Error ? error.message : String(error),
      });
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
