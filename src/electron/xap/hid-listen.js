const HIDDevices = require('./hid-devices');
const EventEmitter = require('events').EventEmitter;

class HIDListen extends EventEmitter {
  /**
   *
   * @param {HIDDevices} hid_devices
   */
  constructor(hid_devices) {
    super();
    var me = this;
    this.hid_listen = HIDDevices.DeviceFilter(hid_devices, 0xff31, 0x74, true);
    this.hid_listen.on('connect', this._onConnect.bind(this));
    this.hid_listen.on('disconnect', this._onDisconnect.bind(this));
    this.hid_listen.on('data', function (device, data) {
      me._onData(device, data);
    });

    this.buffers = new Map();
  }

  _onConnect(device) {
    this.buffers[device.path] = '';
    this.emit('connect', device.info);
  }

  _onDisconnect(device) {
    this.emit('disconnect', device.info);
    if (this.buffers.has(device.path)) {
      this.buffers.delete(device.path);
    }
  }

  _onData(device, data) {
    var buffer = this.buffers[device.path];
    buffer = buffer + data.toString();
    while (buffer.indexOf('\n') !== -1) {
      while (buffer.length > 0 && buffer[0] === '\0') {
        buffer = buffer.substr(1);
      }
      var newlineIdx = buffer.indexOf('\n');
      var thisLine = buffer.substr(0, newlineIdx);
      buffer = buffer.substr(newlineIdx + 1);
      this.emit('text', device.info, thisLine);
    }
    this.buffers[device.path] = buffer;
  }
}

/**
 *
 * @param {HIDDevices} hid_devices
 * @returns {HIDListen}
 */
module.exports = function createListener(hid_devices) {
  return new HIDListen(hid_devices);
};
