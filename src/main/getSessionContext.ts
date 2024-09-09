import os from 'os';
const currentDateTime = new Date().toLocaleString();

export const getSessionContext = () => {
  const platform = os.platform();
  const release = os.release();
  const homedir = os.homedir();

  const osName = ((): string => {
    switch (platform) {
      case 'win32':
        return `Windows ${release}`;
      case 'darwin':
        return `macOS ${release}`;
      case 'linux':
        return `Linux ${release}`;
      default:
        return 'Unknown';
    }
  })();

  return `
<SESSION_CONTEXT desc="Useful info about the this session" note="Consider when executing commands ('dir' for Windows or 'ls' for macOS/Linux)">
Current date: ${currentDateTime}

System Information:
- OS: ${osName}
- Platform: ${platform}
- Home Directory: ${homedir}
</SESSION_CONTEXT>
`;
};