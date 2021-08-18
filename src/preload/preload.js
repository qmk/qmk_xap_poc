const { contextBridge } = require('electron');
const { ipcRenderer } = require('electron-better-ipc');

contextBridge.exposeInMainWorld('ipc', {
  answerMain: (channel, callback) => ipcRenderer.answerMain(channel, callback),
  callMain: (channel, data) => ipcRenderer.callMain(channel, data),
});

const { xapRenderer } = require('../xap/xap');
xapRenderer.attach();
