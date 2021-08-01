<template>
  <div ref="terminal" id="terminal"></div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onMounted } from 'vue';
import { ITerminalOptions, Terminal } from 'xterm';
import * as XtermWebfont from 'xterm-webfont';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import chalk from 'chalk';

export default defineComponent({
  name: 'HidListen',
  setup() {
    const connects = ref(0);
    const disconnects = ref(0);
    const term = new Terminal({
      cols: 90,
      scrollback: 500,
      fontFamily: 'Iosevka Fixed Web',
      fontSize: 10,
      lineHeight: 1.5,
    } as ITerminalOptions);
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new XtermWebfont());
    const ctx = new chalk.Instance({ level: 2 });
    onMounted(() => {
      window.ipc.answerMain(
        'hid_listen-connect',
        (event: HidConnectionEvent) => {
          console.log(event);
          connects.value++;
          const str = `${event.device.manufacturer} ${event.device.product}: connected`;
          term.writeln(ctx`{blueBright ${str}}`);
        }
      );
      window.ipc.answerMain(
        'hid_listen-disconnect',
        (event: HidConnectionEvent) => {
          console.log(event);
          disconnects.value++;
          const str = `${event.device.manufacturer} ${event.device.product}: disconnected`;
          term.writeln(ctx`{blueBright ${str}}`);
        }
      );
      window.ipc.answerMain('hid_listen-text', (event: HidListenTextEvent) => {
        console.log(event);
        const str = `${event.device.manufacturer} ${event.device.product}: ${event.text}`;
        term.writeln(str);
      });
      const terminal = document.getElementById('terminal');
      if (terminal !== null) {
        term.loadWebfontAndOpen(terminal);
        window.addEventListener('resize', function () {
          fitAddon.fit();
        });
        fitAddon.fit();
      }
    });
  },
});
</script>

<style>
#terminal {
  flex: 1 1 auto;
  padding: 0.6em;
  background: #000;
  overflow: hidden;
}
</style>
