const { app, BrowserWindow, ipcMain, dialog } = require('electron');



const createWindow = () => {
    ipcMain.handle("showDialog", (e, message) => {
        return dialog.showOpenDialog({properties: ['openFile']});
    });

    const win = new BrowserWindow({
        width: 1400,
        height: 1000,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        }
    });
    

    win.loadFile('dist/index.html');

    win.removeMenu();
    //win.webContents.openDevTools();
};

app.whenReady().then(() => {
    createWindow();

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