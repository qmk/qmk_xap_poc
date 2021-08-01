<template>
  <div ref="terminal" id="terminal"></div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onMounted } from 'vue';
import { ITerminalOptions, Terminal } from 'xterm';
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
      fontSize: 12,
      lineHeight: 1.5,
    } as ITerminalOptions);
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
        term.open(terminal);
      }
    });
  },
});
</script>
