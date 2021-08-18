const EventEmitter = require('events');
const { contextBridge } = require('electron');
const { ipcRenderer } = require('electron-better-ipc');

class XapRenderer extends EventEmitter {
  constructor() {
    super();
  }

  attach() {
    ipcRenderer.answerMain('usb-connect', this._onUsbConnect.bind(this));
    ipcRenderer.answerMain('usb-disconnect', this._onUsbDisconnect.bind(this));
    ipcRenderer.answerMain('console-connect', this._onConsoleConnect.bind(this));
    ipcRenderer.answerMain('console-disconnect', this._onConsoleDisconnect.bind(this));
    ipcRenderer.answerMain('console-text', this._onConsoleText.bind(this));
    ipcRenderer.answerMain('xap-connect', this._onXapConnect.bind(this));
    ipcRenderer.answerMain('xap-disconnect', this._onXapDisconnect.bind(this));
    ipcRenderer.answerMain('xap-data', this._onXapData.bind(this));

    var me = this;
    contextBridge.exposeInMainWorld('xap', {
      send: (device, buffer) => me.send(device, buffer),
      onUsbConnect: (cb) => me.on('usb-connect', cb),
      onUsbDisconnect: (cb) => me.on('usb-disconnect', cb),
      onConsoleConnect: (cb) => me.on('console-connect', cb),
      onConsoleDisconnect: (cb) => me.on('console-disconnect', cb),
      onConsoleText: (cb) => me.on('console-text', cb),
      onXapConnect: (cb) => me.on('xap-connect', cb),
      onXapDisconnect: (cb) => me.on('xap-disconnect', cb),
      onXapData: (cb) => me.on('xap-data', cb),
    });
  }

  _onUsbConnect(event) {
    console.log('usb-connect', event);
    this.emit('usb-connect', event);
  }

  _onUsbDisconnect(event) {
    console.log('usb-disconnect', event);
    this.emit('usb-disconnect', event);
  }

  _onConsoleConnect(event) {
    console.log('console-connect', event);
    this.emit('console-connect', event);
  }

  _onConsoleDisconnect(event) {
    console.log('console-disconnect', event);
    this.emit('console-disconnect', event);
  }

  _onConsoleText(event) {
    this.emit('console-text', event);
  }

  _onXapConnect(event) {
    console.log('xap-connect', event);
    this.emit('xap-connect', event);
  }

  _onXapDisconnect(event) {
    console.log('xap-disconnect', event);
    this.emit('xap-disconnect', event);
  }

  _onXapData(event) {
    this.emit('xap-data', event);
  }

  send(device, buffer) {
    ipcRenderer.callMain('xap-send', {
      device: device,
      data: buffer,
    });
  }
}

const xapRenderer = new XapRenderer();

module.exports = {
  xapRenderer,
};
