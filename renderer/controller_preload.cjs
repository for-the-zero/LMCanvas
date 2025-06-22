const { ipcRenderer, nativeTheme, contextBridge, shell } = require('electron');
const fs = require('fs/promises');

contextBridge.exposeInMainWorld('electron_apis', {
    ipcRenderer: {
        send: (channel, data) => ipcRenderer.send(channel, data),
        on: (channel, func) => ipcRenderer.on(channel, func),
        invoke: (channel, data) => ipcRenderer.invoke(channel, data),
        removeListener: (channel, func) => ipcRenderer.removeListener(channel, func)
    },
    nativeTheme: {
        shouldUseDarkColors: () => nativeTheme.shouldUseDarkColors
    },
    fs: {
        writeFile: (path, data) => fs.writeFile(path, data, 'utf-8'),
    },
    packed_functions: {
        get_record_file: () => ipcRenderer.invoke('get_record_file'),
    },
    shell: {
        openExternal: (url) => shell.openExternal(url)
    }
});