import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { createHttpServer } from './httpServer';
import { initializeEnvVariables, updateEnvVariables, useSettingsStore } from './store';

// Initialize environment variables
initializeEnvVariables();

let mainWindow: BrowserWindow | null = null;
let httpServerPort: number | null = null;

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

app.whenReady().then(() => {
  createWindow();

  createHttpServer((port) => {
    httpServerPort = port;
    if (mainWindow) {
      mainWindow.webContents.send('http-server-port', port);
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-http-server-url', () => {
  return httpServerPort ? `http://localhost:${httpServerPort}` : null;
});

ipcMain.handle('get-settings', () => {
  return useSettingsStore.getState().getSettingsData();
});

ipcMain.handle('update-settings', (_, newSettings) => {
  useSettingsStore.getState().updateSettingsData(newSettings);
  updateEnvVariables();
  return useSettingsStore.getState().getSettingsData();
});