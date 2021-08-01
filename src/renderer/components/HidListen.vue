<template>
  <div ref="terminal" id="terminal"></div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onMounted } from 'vue';
import { ITerminalOptions, Terminal } from 'xterm';
import 'xterm/css/xterm.css';
export default defineComponent({
  name: 'HidListen',
  setup() {
    const connects = ref(0);
    const disconnects = ref(0);
    const term = new Terminal({
      cols: 90,
      scrollback: 500,
    } as ITerminalOptions);
    onMounted(() => {
      window.ipc.answerMain(
        'hid_listen-connect',
        (event: HidConnectionEvent) => {
          console.log(event);
          connects.value++;
          term.writeln(
            `\x1B[1;34m${event.device.manufacturer} ${event.device.product}: connected\x1B[0m`
          );
        }
      );
      window.ipc.answerMain(
        'hid_listen-disconnect',
        (event: HidConnectionEvent) => {
          console.log(event);
          disconnects.value++;
          term.writeln(
            `\x1B[1;34m${event.device.manufacturer} ${event.device.product}: disconnected\x1B[0m`
          );
        }
      );
      window.ipc.answerMain('hid_listen-text', (event: HidListenTextEvent) => {
        console.log(event);
        term.writeln(
          `${event.device.manufacturer} ${event.device.product}: ${event.text}`
        );
      });
      const terminal = document.getElementById('terminal');
      if (terminal !== null) {
        term.open(terminal);
        term.write('Hello, World!\r\n');
      }
    });
  },
});
</script>
