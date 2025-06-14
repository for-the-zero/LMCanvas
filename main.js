import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const is_dev = !app.isPackaged;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    const win_controller = new BrowserWindow({
        width: 900,
        height: 500,
        center: true,
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            webSecurity: false,
            preload: join(__dirname, 'renderer', 'controller_preload.cjs')
        }
    });
    win_controller.setMenu(null);
    if(is_dev){
        win_controller.loadURL('http://localhost:5173/renderer/controller.html');
        win_controller.webContents.openDevTools();
    } else {
        win_controller.loadFile(join(__dirname, 'build', 'renderer', 'index.html'));
    };
    win_controller.once('ready-to-show', () => {
        win_controller.show();
    });
};

app.whenReady().then(() => { main() });
app.on('window-all-closed', () => {
    if (process.platform!== 'darwin') {
        app.quit();
    };
});