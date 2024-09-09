import { exec } from 'child_process';
import { z } from 'zod';
import { tool } from 'ai';

export const executeCommand = tool({
  description: 'Execute a shell command with `child_process.exec`',
  parameters: z.object({
    command: z.string().describe('Shell command to execute'),
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
});