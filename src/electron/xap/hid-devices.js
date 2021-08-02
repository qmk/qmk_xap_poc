const EventEmitter = require('events').EventEmitter;
const HIDW = require('./node-hid-wrapper');

class HIDDevices extends EventEmitter {
  /**
   *
   * @param {any} usbDetect
   * @param {number} maxProbeCount
   * @param {number} probeDelay
   */
  constructor(usbDetect, maxProbeCount = 10, probeDelay = 100) {
    super();
    this.usbDetect = usbDetect;
    this.started = false;
    this.maxProbeCount = maxProbeCount;
    this.probeDelay = probeDelay;
    this.knownDevices = new Map();
  }

  start() {
    if (this.started === true) {
      return;
    }
    this.started = true;

    // Do a first-pass so that we get all the currently-connected devices.
    this._detectDevices(0);

    // Need to manually handle device connect/disconnect -- the data coming
    // out of usb-detection doesn't enough compared to node-hid.
    // We use node-usb-detection just to work out when a change is made,
    // then kick off the node-hid device discovery over a period of time.
    var me = this;
    me.usbDetect.on('change', function () {
      try {
        me._onDevicesChanged();
      } catch {}
    });
  }

  stop() {
    if (this.started === false) {
      return;
    }

    var me = this;

    // Issue a disconnect for every device we know about, so downstream can
    // determine if they want to do any disconnection handling at shutdown.
    for (const [key, value] of this.knownDevices) {
      me.emit('disconnect', value);
    }

    this.started = false;
  }

  _detectDevices(probeCountRemaining) {
    var me = this;
    var devices = HIDW.devices();
    var currentDevices = new Map();
    devices.forEach((d) => {
      currentDevices.set(d.path, d);
    });

    // Find removed devices -- they'll exist in this.knownDevices but not
    // currentDevices.
    for (const [key, value] of this.knownDevices) {
      if (!currentDevices.has(key)) {
        me.emit('disconnect', value);
      }
    }

    // Find added devices -- they'll exist in currentDevices but not
    // this.knownDevices.
    for (const [key, value] of currentDevices) {
      if (!this.knownDevices.has(key)) {
        me.emit('connect', value);
      }
    }

    // Keep track of the known devices so that we can emit disconnection
    // events at shutdown.
    this.knownDevices = currentDevices;

    // Retry a few times so that we can pick up the new devices appearing -
    // usb-detection triggers before we get node-hid devices showing up.
    if (probeCountRemaining > 0) {
      var me = this;
      setTimeout(function () {
        me._detectDevices(probeCountRemaining - 1);
      }, me.probeDelay);
    }
  }

  _onDevicesChanged() {
    var me = this;
    setTimeout(function () {
      me._detectDevices(me.maxProbeCount);
    }, me.probeDelay);
  }
}

class HIDDevice extends EventEmitter {
  /**
   *
   * @param {HIDDevices} d
   * @param {boolean} listenForData
   */
  constructor(d, listenForData) {
    super();
    this.info = d;
    this.device = HIDW.construct(d.path);
    this.device.setNonBlocking(1);
    if (listenForData) {
      this.device.on('data', this._onData.bind(this));
      this.device.on('error', this._onError.bind(this));
    }
  }

  write(...dataBytes) {
    var dataBuffer = Buffer.from([...dataBytes]);
    this.writeBuffer(dataBuffer);
  }

  writeBuffer(dataBuffer) {
    var reportIdBuffer = Buffer.from([0]);
    var buffer = Buffer.concat([reportIdBuffer, dataBuffer]);
    this.device.write(buffer);
  }

  close() {
    this.device.close();
  }

  _onData(data) {
    if (data.length > 0) {
      this.emit('data', data);
    }
  }

  _onError(err) {
    /* No-op -- if we don't have this callback set, the app closes. */
  }
}

class HIDDeviceFilter extends EventEmitter {
  /**
   *
   * @param {HIDDevices} hid_devices
   * @param {number} usagePage
   * @param {number} usageId
   * @param {boolean} listenForData
   */
  constructor(hid_devices, usagePage, usageId, listenForData) {
    super();
    this.usage_page = usagePage;
    this.usage_id = usageId;
    this.listen_for_data = listenForData;
    this.device_map = new Map();
    hid_devices.on('connect', this._onConnect.bind(this));
    hid_devices.on('disconnect', this._onDisconnect.bind(this));
  }

  *devices() {
    for (const [_, value] of this.device_map.entries()) {
      yield value;
    }
  }

  _usagePageAndIdMatch(d) {
    return d.usagePage === this.usage_page && d.usage === this.usage_id;
  }

  _onConnect(d) {
    if (!('path' in d)) {
      return;
    }
    if (this._usagePageAndIdMatch(d)) {
      try {
        var device = new HIDDevice(d, this.listen_for_data);
        this.emit('connect', device);
        if (this.listen_for_data) {
          var me = this;
          device.on('data', function (data) {
            me._onData(device, data);
          });
          this.device_map.set(d.path, device);
        }
      } catch (e) {
        console.error(`Failed to open device at path ${d.path}`);
      }
    }
  }

  _onDisconnect(d) {
    if (this._usagePageAndIdMatch(d)) {
      if (this.device_map.has(d.path)) {
        var device = this.device_map.get(d.path);
        this.emit('disconnect', device);
        device.close();
        this.device_map.delete(d.path);
      }
    }
  }

  _onData(device, data) {
    this.emit('data', device, data);
  }
}

/**
 * Create a HIDDevices object
 * @param {any} usbDetect
 * @param {number} maxProbeCount
 * @param {number} probeDelay
 * @returns HIDDevices
 */
function Create(usbDetect, maxProbeCount = 10, probeDelay = 100) {
  return new HIDDevices(usbDetect, maxProbeCount, probeDelay);
}

/**
 * Create a HIDDevices Filter
 * @param {HIDDevices} hid_devices
 * @param {number} usagePage
 * @param {number} usageId
 * @param {boolean} listenForData
 * @returns HIDDeviceFilter
 */
function DeviceFilter(hid_devices, usagePage, usageId, listenForData = false) {
  return new HIDDeviceFilter(hid_devices, usagePage, usageId, listenForData);
}

module.exports = {
  Create: Create,
  DeviceFilter: DeviceFilter,
};
