import { app, BrowserWindow,Menu,dialog,ipcMain } from 'electron';

import path from 'node:path';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}


let mainWindow;
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight:600,
    autoHideMenuBar:true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration:false,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.webContents.on('found-in-page', (event, result) => {
    if (result.finalUpdate) {
      mainWindow.webContents.stopFindInPage('keepSelection');
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});






// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


//____finding text__________




ipcMain.on('search_text', (event, arg) => {
  // mainWindow.webContents.findInPage(arg,{forward:true});
  find_in_pdf(arg);
  console.log("this working");
});

function find_in_pdf(searchText){
  // let allContents = mainWindow.webContents.getAllWebContents(); // Get all webContents, including iframes
  console.log(mainWindow.webContents.getAllWebContents())
  // for (let wc of allContents) {
  //   if (wc.hostWebContents) { // Check if it's an iframe or webview
  //     wc.findInPage(searchText,{forward:true});
  //     break;
  //   }
  // }
}