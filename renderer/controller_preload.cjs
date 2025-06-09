const { ipcRenderer, nativeTheme, contextBridge, dialog } = require('electron');
const fs = require('fs/promises');

contextBridge.exposeInMainWorld('electron_apis', {
    ipcRenderer: {
        send: (channel, data) => ipcRenderer.send(channel, data),
        on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
        invoke: (channel, data) => ipcRenderer.invoke(channel, data)
    },
    nativeTheme: {
        shouldUseDarkColors: () => nativeTheme.shouldUseDarkColors
    },
    fs: {
        fs_writeFile: (path, data, encoding) => fs.writeFile(path, data, encoding),
        fs_readFile: (path, encoding) => fs.readFile(path, encoding),
    },
    dialog: {
        showOpenDialog: (options) => dialog.showOpenDialog(options)
    }
});