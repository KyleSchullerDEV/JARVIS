import os from 'os';
import path from 'path';

interface SystemInfo {
  osName: string;
  platform: string;
  homedir: string;
  desktopPath: string;
  documentsPath: string;
}

export const getSystemInfo = (): SystemInfo => {
  const platform = os.platform();
  const release = os.release();
  const homedir = os.homedir();

  const desktopPath = path.join(homedir, 'Desktop');
  const documentsPath = path.join(homedir, 'Documents');

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

  return {
    osName,
    platform,
    homedir,
    desktopPath,
    documentsPath,
  };
};