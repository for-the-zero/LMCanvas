const { contextBridge, ipcRenderer, shell, clipboard, net } = require('electron');
const fs = require('fs').promises;
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
    fs: {
        readFile: (path, options) => fs.readFile(path, options),
        writeFile: (path, data, options) => fs.writeFile(path, data, options),
        readdir: (path, options) => fs.readdir(path, options),
        mkdir: (path, options) => fs.mkdir(path, options),
        stat: (path, options) => fs.stat(path, options),
    },
    path: {
        join: (...paths) => path.join(...paths),
        resolve: (...paths) => path.resolve(...paths),
        basename: (p, ext) => path.basename(p, ext),
        dirname: (p) => path.dirname(p),
        extname: (p) => path.extname(p),
    },
    clipboard: {
        readText: (...args) => clipboard.readText(...args),
        writeText: (...args) => clipboard.writeText(...args),
    },
    fetch: (...args) => net.fetch(...args),
    shell: {
        openExternal: (...args) => shell.openExternal(...args),
        showItemInFolder: (...args) => shell.showItemInFolder(...args),
        openPath: (...args) => shell.openPath(...args),
    },
    ipcRenderer: {
        send: (channel, ...args) => ipcRenderer.send(channel, ...args),
        on: (channel, listener) => ipcRenderer.on(channel, listener),
    }
});