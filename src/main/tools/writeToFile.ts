import fs from 'fs/promises';
import { z } from 'zod';
import { tool } from 'ai';

export const writeToFile = tool({
  description: 'Write content to a file with `fs.writeFile`',
  parameters: z.object({
    path: z.string().describe('Path of the file to write'),
    content: z.string().describe('Content to write to the file'),
  }),
  execute: async ({ path, content }) => {
    try {
      await fs.writeFile(path, content, 'utf-8');
      return `Content successfully written to ${path}`;
    } catch (error) {
      return `Error writing file: ${(error as Error).message}`;
    }
  },
});