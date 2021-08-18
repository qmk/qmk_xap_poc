import { ITerminalOptions, Terminal } from 'xterm';
import { nextTick } from 'vue';
import XtermWebfont from 'xterm-webfont';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import chalk_ from 'chalk';
import { sprintf } from 'sprintf-js';
import { HidDeviceInfo, XapConnectionEvent, XapDataEvent, XapTextEvent } from '../../xap/xap';

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
    term.loadWebfontAndOpen(el);
    window.addEventListener('resize', resizeWindow);
    resizeWindow();
    return term;
  } catch (err) {
    console.error(chalk`{red.bold.bgGreen XAP: Unable to initialize xterm console}`, err);
    throw err;
  }
}

function timeStr(timestamp: Date): string {
  return sprintf('[%2d:%02d:%02d.%03d]', timestamp.getHours(), timestamp.getMinutes(), timestamp.getSeconds(), timestamp.getMilliseconds());
}

function deviceStr(device: HidDeviceInfo): string {
  return sprintf('[%04X:%04X] %s %s', device.vendorId, device.productId, device.manufacturer, device.name);
}

window.xap.onUsbConnect((event: XapConnectionEvent) => {
  console.log(event);
  const str = chalk`{cyanBright ${timeStr(event.timestamp)} *** ${deviceStr(event.device)}: USB device connected}`;
  term.writeln(str);
});

window.xap.onUsbDisconnect((event: XapConnectionEvent) => {
  console.log(event);
  const str = chalk`{cyanBright ${timeStr(event.timestamp)} *** ${deviceStr(event.device)}: USB device disconnected}`;
  term.writeln(str);
});

window.xap.onConsoleConnect((event: XapConnectionEvent) => {
  console.log(event);
  const str = chalk`{blueBright ${timeStr(event.timestamp)} *** ${event.device.manufacturer} ${event.device.name}: console connected}`;
  term.writeln(str);
});

window.xap.onConsoleDisconnect((event: XapConnectionEvent) => {
  console.log(event);
  const str = chalk`{blueBright ${timeStr(event.timestamp)} *** ${event.device.manufacturer} ${event.device.name}: console disconnected}`;
  term.writeln(str);
});

window.xap.onConsoleText((event: XapTextEvent) => {
  console.log(event);
  const str = chalk`{blueBright ${timeStr(event.timestamp)}   > ${event.device.manufacturer} ${event.device.name}: ${event.text}}`;
  term.writeln(str);
});

window.xap.onXapConnect((event: XapConnectionEvent) => {
  console.log(event);
  const str = chalk`{magentaBright ${timeStr(event.timestamp)} *** ${event.device.manufacturer} ${event.device.name}: XAP connected}`;
  term.writeln(str);
});

window.xap.onXapDisconnect((event: XapConnectionEvent) => {
  console.log(event);
  const str = chalk`{magentaBright ${timeStr(event.timestamp)} *** ${event.device.manufacturer} ${event.device.name}: XAP disconnected}`;
  term.writeln(str);
});

window.xap.onXapData((event: XapDataEvent) => {
  console.log(event);
  const str = chalk`{magentaBright ${timeStr(event.timestamp)}   > ${event.device.manufacturer} ${event.device.name}: ${event.data}}`;
  term.writeln(str);
});
