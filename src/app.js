// process.env.NODE_ENV = 'production'

const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = require("electron");
const path = require("path");
const fs = require("fs");
const { fileGetter } = require("./lib/dialog.js");
const { autoUpdater } = require('electron-updater')
//require('v8-compile-cache');

// DISABLE_V8_COMPILE_CACHE=1

//process.env.NODE_ENV === "production";
app.setName('Log Parser')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

var mainWindow;

const createWindow = () => {
  
  mainWindow = new BrowserWindow({
    width: 1276,
    height: 800,
    resizable:true,
    webPreferences: {
      nodeIntegration: true, // access node globals
      contextIsolation: false,
      devTools: true
    }
  });

  // build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  
  // insert the menu
  Menu.setApplicationMenu(mainMenu);
  // Create the browser window.

  //mainWindow.webContents.openDevTools({ mode: "detach" });
  //mainWindow.webContents.send('message', 'hello from main process')
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on("ready", createWindow);


  



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    mainWindow = null;
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// if mainwindw is defined
if (mainWindow){
  mainWindow.on('closed', function (){
    mainWindow = null;
  })

}

// sending app version on app_version event
ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

// create menu template
const mainMenuTemplate = [
  // {}, //clears first index  //solves problem on mac computers. leaves space on windows
 
  {
    label: "Select File",
    accelerator: process.platform == "darwin" ? "Command+L" : "Ctrl+L",
    async click() {
      try {
        const data = await fileGetter();
        mainWindow.webContents.send("data", data);
      } catch (error) {
        console.log(error);
      }
    }
  },
  {
    label: "Restart App",
    click() {
      mainWindow = null;
      app.relaunch();
      app.exit();
      app.quit();
    },
  },
  {
    // needed for mac versions
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: "Quit App",
    accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
    click() {
      mainWindow = null;
      app.quit();
    },
  },
];

// if mac add empty object to menu
// if (process.platform == "darwin") {
//   mainMenuTemplate.unshift({label :app.getName()}); // push empty object.
// }

//add developer tools if not in production
// if (process.env.NODE_ENV !== "production") {
//   mainMenuTemplate.push({
//     label: "developer tools",
//     submenu: [
//       {
//         label: "toggle DevTools",
//         accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
//         click(item, focusedwindow) {
//           focusedwindow.toggleDevTools();
//         },
//       },
//       {
//         role: "reload",
//       },
//     ],
//   });
// }




process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
ELECTRON_ENABLE_LOGGING = 1;

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// update program if new version logic
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});


autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});
