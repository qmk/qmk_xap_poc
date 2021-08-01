import { ITerminalOptions, Terminal } from 'xterm';
import { nextTick } from 'vue';
import * as XtermWebfont from 'xterm-webfont';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import chalk_ from 'chalk';

export const term = new Terminal({
  cols: 90,
  scrollback: 500,
  fontFamily: 'Iosevka Fixed Web',
  fontSize: 13,
  lineHeight: 1.25,
} as ITerminalOptions);

const fitAddon = new FitAddon();
export function resizeWindow() {
  nextTick(fitAddon.fit);
}
term.loadAddon(fitAddon);
term.loadAddon(new XtermWebfont());

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
