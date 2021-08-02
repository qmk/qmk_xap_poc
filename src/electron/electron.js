// electron/electron.js
const path = require('path');
const { app, protocol, BrowserWindow } = require('electron');
const windowStateKeeper = require('electron-window-state');
const { ipcMain } = require('electron-better-ipc');

try {
  require('electron-reloader')(module);
} catch {}

const usb_detect = require('usb-detection');
const HIDDevices = require('./xap/hid-devices');
const HIDListen = require('./xap/hid-listen');
let mainWindow;

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

const isDev = process.env.IS_DEV == 'true' ? true : false;

///////////
// Start crappy implementation of hid_listen
///////////

usb_detect.startMonitoring();
app.on('will-quit', () => {
  usb_detect.stopMonitoring();
  hid_devices.stop();
});

const hid_devices = HIDDevices.Create(usb_detect);

usb_detect.on('add', async (d) => {
  try {
    await ipcMain.callRenderer(mainWindow, 'usb_detect-connect', {
      device: d,
      timestamp: new Date(),
    });
  } catch {}
});

usb_detect.on('remove', async (d) => {
  try {
    await ipcMain.callRenderer(mainWindow, 'usb_detect-disconnect', {
      device: d,
      timestamp: new Date(),
    });
  } catch {}
});

const hid_listen = HIDListen(hid_devices);

hid_listen.on('connect', async (d) => {
  try {
    await ipcMain.callRenderer(mainWindow, 'hid_listen-connect', {
      device: d,
      timestamp: new Date(),
    });
  } catch {}
});

hid_listen.on('disconnect', async (d) => {
  try {
    await ipcMain.callRenderer(mainWindow, 'hid_listen-disconnect', {
      device: d,
      timestamp: new Date(),
    });
  } catch {}
});

hid_listen.on('text', async (d, text) => {
  try {
    await ipcMain.callRenderer(mainWindow, 'hid_listen-text', {
      device: d,
      timestamp: new Date(),
      text: text,
    });
  } catch {}
});

///////////
// End crappy implementation of hid_listen
///////////

function createWindow() {
  protocol.registerFileProtocol('app', (request, callback) => {
    var url = request.url.substr(6);
    callback({ path: path.join(__dirname, '../../dist', url) });
  });

  const mainWindowState = windowStateKeeper({
    defaultWidth: 960,
    defaultHeight: 640,
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 960,
    minHeight: 640,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      allowRunningInsecureContent: false,
      enableRemoteModule: false,
    },
  });

  mainWindowState.manage(mainWindow);

  // and load the index.html of the app.
  // win.loadFile("index.html");
  let loaded = mainWindow.loadURL(
    isDev ? 'http://localhost:3000' : 'app://./index.html'
  );

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Start monitoring USB events
  loaded.then(() => {
    hid_devices.start();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
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

// Exit cleanly on request from parent process in development mode.
if (isDev) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
