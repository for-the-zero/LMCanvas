import { app, BrowserWindow, ipcMain, dialog, nativeImage } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const is_dev = !app.isPackaged;
//const is_dev = false;
const __filename = fileURLToPath(import.meta.url);
const __dirname = is_dev ? dirname(__filename) : app.getAppPath();

ipcMain.handle('get_record_file', async (e) => {
    let path = '';
    let filecontent = '';
    let result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'JSON Record File', extensions: ['json'] }
        ]
    });
    if (!result.canceled) {
        path = result.filePaths[0];
        try{
            filecontent = await fs.promises.readFile(path, 'utf-8');
        } catch(err){
            return {content: '', path: '', error: err.message};
        };
    } else {
        return {content: '', path: '', error: 'Canceled'};
    };
    return {content: filecontent, path, error: false};
});

function main() {
    // win_controller
    const win_controller = new BrowserWindow({
        width: 900,
        height: 500,
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            webSecurity: false,
            preload: join(__dirname, 'renderer', 'controller_preload.cjs')
        }
    });
    win_controller.setIcon(nativeImage.createFromPath(join(__dirname, "icon.png")));
    win_controller.setMenu(null);
    if(is_dev){
        win_controller.loadURL('http://localhost:5173/renderer/controller.html');
        win_controller.webContents.openDevTools();
    } else {
        win_controller.loadFile(join(__dirname, 'dist', 'renderer', 'controller.html'));
        //win_controller.webContents.openDevTools();// remove
    };
    win_controller.once('ready-to-show', () => {
        win_controller.show();
    });

    // win_canvas
    const win_canvas = new BrowserWindow({
        width: 900,
        height: 500,
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            webSecurity: false,
            preload: join(__dirname, 'renderer', 'canvas_preload.cjs')
        }
    });
    win_canvas.setIcon(nativeImage.createFromPath(join(__dirname, "icon.png")));
    win_canvas.setMenu(null);
    if(is_dev){
        win_canvas.loadURL('http://localhost:5173/renderer/canvas.html');
        win_canvas.webContents.openDevTools();
    } else {
        win_canvas.loadFile(join(__dirname, 'dist', 'renderer', 'canvas.html'));
        //win_canvas.webContents.openDevTools();// remove
    };
    win_canvas.once('ready-to-show', () => {
        win_canvas.show();
    });

    // ipc
    ipcMain.on('controller2main', (e, msg) => {
        win_canvas.webContents.send('main2canvas', msg);
    });
    ipcMain.on('canvas2main', (e, msg) => {
        win_controller.webContents.send('main2controller', msg);
    });
    ipcMain.on('reset', (e) => {
        win_canvas.webContents.reload();
    });
};

app.whenReady().then(() => { main() });
app.on('window-all-closed', () => {
    if (process.platform!== 'darwin') {
        app.quit();
    };
});