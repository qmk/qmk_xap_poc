const EventEmitter = require('events');
const { app } = require('electron');
const { ipcMain } = require('electron-better-ipc');

const usb_detect = require('usb-detection');
const HIDDevices = require('./hid-devices');

function usbDetectDeviceToXapDevice(device) {
  return {
    manufacturer: device.manufacturer,
    name: device.deviceName,
    productId: device.productId,
    vendorId: device.vendorId,
  };
}

function nodeHidDeviceToXapDevice(device) {
  return {
    manufacturer: device.info.manufacturer,
    name: device.info.product,
    path: device.info.path,
    productId: device.info.productId,
    usage: device.info.usage,
    usagePage: device.info.usagePage,
    vendorId: device.info.vendorId,
  };
}

class XapElectron extends EventEmitter {
  constructor() {
    super();
  }

  attach(mainWindow) {
    // Set up the listener objects
    this.mainWindow = mainWindow;
    this.hid_devices = HIDDevices.Create(usb_detect);
    this.hid_listen = HIDDevices.DeviceFilter(this.hid_devices, 0xff31, 0x74, true);
    this.xap_connector = HIDDevices.DeviceFilter(this.hid_devices, 0xff51, 0x58, true);

    // Setup listeners for USB connection events
    usb_detect.on('add', this._onUsbConnect.bind(this));
    usb_detect.on('remove', this._onUsbDisconnect.bind(this));

    // Setup listeners for console
    this.hid_listen.on('connect', this._onConsoleConnect.bind(this));
    this.hid_listen.on('disconnect', this._onConsoleDisconnect.bind(this));
    this.hid_listen.on('data', this._onConsoleData.bind(this));
    this.hid_listen_data = new Map();

    // Setup listeners for XAP
    this.xap_connector.on('connect', this._onXapConnect.bind(this));
    this.xap_connector.on('disconnect', this._onXapDisconnect.bind(this));
    this.xap_connector.on('data', this._onXapData.bind(this));

    // Handle messages coming from the renderer process to send to the device
    ipcMain.answerRenderer('hid_xap-send', this._onXapSend.bind(this));

    // Start listening for USB connects/disconnects, and unregister if we're quitting the app
    app.on('will-quit', this._onAppWillQuit.bind(this));
    usb_detect.startMonitoring();
    this.hid_devices.start();
  }

  async _onUsbConnect(device) {
    try {
      await ipcMain.callRenderer(this.mainWindow, 'usb-connect', {
        device: usbDetectDeviceToXapDevice(device),
        timestamp: new Date(),
      });
    } catch {}
  }

  async _onUsbDisconnect(device) {
    try {
      await ipcMain.callRenderer(this.mainWindow, 'usb-disconnect', {
        device: usbDetectDeviceToXapDevice(device),
        timestamp: new Date(),
      });
    } catch {}
  }

  async _onConsoleConnect(device) {
    try {
      this.hid_listen_data[device.info.path] = '';
      await ipcMain.callRenderer(this.mainWindow, 'console-connect', {
        device: nodeHidDeviceToXapDevice(device),
        timestamp: new Date(),
      });
    } catch {}
  }

  async _onConsoleDisconnect(device) {
    try {
      await ipcMain.callRenderer(this.mainWindow, 'console-disconnect', {
        device: nodeHidDeviceToXapDevice(device),
        timestamp: new Date(),
      });
      this.hid_listen_data.delete(device.info.path);
    } catch {}
  }

  async _onConsoleData(device, buffer) {
    try {
      var text = this.hid_listen_data[device.info.path];
      var view = buffer.subarray(0, buffer.length);
      while (view.length > 0) {
        // Work out line end position
        var cr_pos = view.indexOf('\r'.charCodeAt(0));
        if (cr_pos === -1) cr_pos = 999;
        var lf_pos = view.indexOf('\n'.charCodeAt(0));
        if (lf_pos === -1) lf_pos = 999;
        var terminator = Math.min(cr_pos, lf_pos);
        if (terminator !== 999) {
          // Get the slice of the string to output
          var slice = view.subarray(0, terminator);

          // We have a newline, so send it across to the renderer
          text += slice.toString();
          await ipcMain.callRenderer(this.mainWindow, 'console-text', {
            device: nodeHidDeviceToXapDevice(device),
            timestamp: new Date(),
            text: text,
          });
          text = '';

          // Update the view as we progress through the buffer
          view = view.subarray(terminator + 1, view.length);
        }

        // Work out the null terminator, if supplied
        var terminator = view.indexOf(0);
        var slice = view.subarray(0, terminator === -1 ? view.length : terminator);
        if (slice.length > 0) text += slice.toString();

        // Update the view as we progress through the buffer
        view = view.subarray(terminator + 1, view.length);

        // If there's no null terminator, then we're consuming the whole buffer. No need to continue.
        if (terminator === -1) break;
      }

      // Update the stored data
      this.hid_listen_data[device.info.path] = text;
    } catch {}
  }

  async _onXapConnect(device) {
    try {
      await ipcMain.callRenderer(this.mainWindow, 'xap-connect', {
        device: nodeHidDeviceToXapDevice(device),
        timestamp: new Date(),
      });
    } catch {}
  }

  async _onXapDisconnect(device) {
    try {
      await ipcMain.callRenderer(this.mainWindow, 'xap-disconnect', {
        device: nodeHidDeviceToXapDevice(device),
        timestamp: new Date(),
      });
    } catch {}
  }

  async _onXapData(device, data) {
    try {
      await ipcMain.callRenderer(this.mainWindow, 'xap-data', {
        device: nodeHidDeviceToXapDevice(device),
        timestamp: new Date(),
        text: text,
      });
    } catch {}
  }

  async _onXapSend(data, window) {
    console.log(data);
  }

  async _onAppWillQuit() {
    try {
      usb_detect.stopMonitoring();
    } catch {}
    try {
      this.hid_devices.stop();
    } catch {}
  }
}

const xapElectron = new XapElectron();

module.exports = {
  xapElectron,
};
