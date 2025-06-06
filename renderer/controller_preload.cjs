const { ipcRenderer, nativeTheme, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron_apis', {
    ipcRenderer: {
        send: (channel, data) => ipcRenderer.send(channel, data),
        on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
        invoke: (channel, data) => ipcRenderer.invoke(channel, data)
    },
    nativeTheme: {
        shouldUseDarkColors: () => nativeTheme.shouldUseDarkColors
    }
});