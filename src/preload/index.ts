import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getHttpServerUrl: () => ipcRenderer.invoke('get-http-server-url'),
  onHttpServerStart: (callback: (port: number) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, port: number) => callback(port);
    ipcRenderer.on('http-server-port', listener);
    return () => {
      ipcRenderer.removeListener('http-server-port', listener);
    };
  },
});