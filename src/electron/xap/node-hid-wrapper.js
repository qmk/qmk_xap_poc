const HID = require('node-hid');

// Patch linux for its missing usagePage
HID.devices = new Proxy(HID.devices, {
  apply(target, ctx, args) {
    const devices = target.apply(ctx, args);
    if (process.platform === 'linux') {
      devices.forEach((d) => {
        if (!d.usagePage || !d.usage) {
          const hidraw = `/sys/class/hidraw/${path.basename(
            d.path
          )}/device/report_descriptor`;
          if (fs.existsSync(hidraw)) {
            const report = fs.readFileSync(hidraw);

            d.usagePage = (report[2] << 8) + report[1];
            d.usage = report[4];
          }
        }
      });
    }
    return devices;
  },
});

// Patch for HID.HID.read to use timeout to work round blocking reads and .close()
//   not allowing the process to quit - https://github.com/node-hid/node-hid/issues/61
HID.HID = new Proxy(HID.HID, {
  construct(Target, args) {
    const ret = new Target(...args);
    ret.read = function readUseTimeout(callback) {
      try {
        const data = this.readTimeout(20);

        setTimeout(() => {
          callback(null, Buffer.from(data));
        }, 0);
      } catch (err) {
        callback(err, null);
      }
    };
    return ret;
  },
});

module.exports = {
  construct: (...args) => new HID.HID(...args),
  devices: () => HID.devices(),
};
