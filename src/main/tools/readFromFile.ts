import fs from 'fs/promises';
import { z } from 'zod';
import { tool } from 'ai';

export const readFromFile = tool({
  description: 'Read the contents of a file with `fs.readFile`',
  parameters: z.object({
    path: z.string().describe('Path of the file to read'),
  }),
  execute: async ({ path }) => {
    try {
      return await fs.readFile(path, 'utf-8');
    } catch (error) {
      return `Error reading file: ${(error as Error).message}`;
    }
  },
});