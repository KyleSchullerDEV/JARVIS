import fs from "fs/promises";
import { exec } from "child_process";
import { z } from "zod";
import { tool } from "ai";

export const tools = {
  readFromFile: tool({
    description: "Read the contents of a file with `fs.readFile`",
    parameters: z.object({
      path: z.string().describe("Path of the file to read"),
    }),
    execute: async ({ path }) => {
      try {
        return await fs.readFile(path, "utf-8");
      } catch (error) {
        return `Error reading file: ${(error as Error).message}`;
      }
    },
  }),

  writeToFile: tool({
    description: "Write content to a file with `fs.writeFile`",
    parameters: z.object({
      path: z.string().describe("Path of the file to write"),
      content: z.string().describe("Content to write to the file"),
    }),
    execute: async ({ path, content }) => {
      try {
        await fs.writeFile(path, content, "utf-8");
        return `Content successfully written to ${path}`;
      } catch (error) {
        return `Error writing file: ${(error as Error).message}`;
      }
    },
  }),

  executeCommand: tool({
    description: "Execute a shell command with `child_process.exec`",
    parameters: z.object({
      command: z.string().describe("Shell command to execute"),
    }),
    execute: async ({ command }) => {
      return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            resolve(`Error: ${error.message}`);
          } else if (stderr) {
            resolve(`stderr: ${stderr}`);
          } else {
            resolve(stdout);
          }
        });
      });
    },
  }),
};