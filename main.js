const isDev = true;

import { app, BrowserWindow } from 'electron';

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: isDev,
            webSecurity: false,
        }
    });
    isDev
        ? win.loadURL('http://localhost:5173/renderer/controller.html')
        : win.loadFile('../build/renderer/index.html');
};

app.whenReady().then(createWindow);