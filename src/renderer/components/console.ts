import { ITerminalOptions, Terminal } from 'xterm';
import { nextTick } from 'vue';
import XtermWebfont from 'xterm-webfont';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import chalk_ from 'chalk';
import { sprintf } from 'sprintf-js';
import {
  UsbConnectionEvent,
  HidConnectionEvent,
  HidListenTextEvent,
} from '../../common/xap';
import { Device } from 'usb-detection';

export const term = new Terminal({
  cols: 90,
  scrollback: 500,
  fontFamily: 'Iosevka Fixed Web',
  fontSize: 13,
  lineHeight: 1.25,
} as ITerminalOptions);

const fitAddon = new FitAddon();
const webFont = new XtermWebfont();
export function resizeWindow() {
  nextTick(() => {
    fitAddon.fit();
  });
}
term.loadAddon(fitAddon);
term.loadAddon(webFont);

export const chalk = new chalk_.Instance({ level: 2 });
export function initTerminal(el: HTMLElement): Terminal {
  try {
    (term as any).loadWebfontAndOpen(el);
    window.addEventListener('resize', resizeWindow);
    resizeWindow();
    return term;
  } catch (err) {
    console.error(
      chalk`{red.bold.bgGreen XAP: Unable to initialize xterm console}`,
      err
    );
    throw err;
  }
}

function timeStr(timestamp: Date): string {
  return sprintf(
    '[%2d:%02d:%02d.%03d]',
    timestamp.getHours(),
    timestamp.getMinutes(),
    timestamp.getSeconds(),
    timestamp.getMilliseconds()
  );
}

function deviceStr(device: Device): string {
  return sprintf(
    '[%04X:%04X] %s %s',
    device.vendorId,
    device.productId,
    device.manufacturer,
    device.deviceName
  );
}

window.ipc.answerMain('usb_detect-connect', (event: UsbConnectionEvent) => {
  console.log(event);
  const str = chalk`{cyanBright ${timeStr(event.timestamp)} *** ${deviceStr(
    event.device
  )}: USB device connected}`;
  term.writeln(str);
});

window.ipc.answerMain('usb_detect-disconnect', (event: UsbConnectionEvent) => {
  console.log(event);
  const str = chalk`{cyanBright ${timeStr(event.timestamp)} *** ${deviceStr(
    event.device
  )}: USB device disconnected}`;
  term.writeln(str);
});

window.ipc.answerMain('hid_listen-connect', (event: HidConnectionEvent) => {
  console.log(event);
  const str = chalk`{blueBright ${timeStr(event.timestamp)} *** ${
    event.device.manufacturer
  } ${event.device.product}: console connected}`;
  term.writeln(str);
});

window.ipc.answerMain('hid_listen-disconnect', (event: HidConnectionEvent) => {
  console.log(event);
  const str = chalk`{blueBright ${timeStr(event.timestamp)} *** ${
    event.device.manufacturer
  } ${event.device.product}: console disconnected}`;
  term.writeln(str);
});

window.ipc.answerMain('hid_listen-text', (event: HidListenTextEvent) => {
  console.log(event);
  const str = chalk`{blueBright ${timeStr(event.timestamp)}   > ${
    event.device.manufacturer
  } ${event.device.product}: ${event.text}}`;
  term.writeln(str);
});
