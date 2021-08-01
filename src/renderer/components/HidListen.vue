<template>
  <div id="terminal"></div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

import { term, chalk, initTerminal } from './console';

export default defineComponent({
  name: 'HidListen',
  setup() {
    const connects = ref(0);
    const disconnects = ref(0);
    onMounted(() => {
      window.ipc.answerMain(
        'hid_listen-connect',
        (event: HidConnectionEvent) => {
          console.log(event);
          const str = chalk`{blueBright ${event.device.manufacturer} ${event.device.product}: connected}`;
          term.writeln(str);
          connects.value++;
        }
      );
      window.ipc.answerMain(
        'hid_listen-disconnect',
        (event: HidConnectionEvent) => {
          console.log(event);
          const str = chalk`{blueBright ${event.device.manufacturer} ${event.device.product}: disconnected}`;
          term.writeln(str);
          disconnects.value++;
        }
      );
      window.ipc.answerMain('hid_listen-text', (event: HidListenTextEvent) => {
        console.log(event);
        const str = chalk`{blueBright ${event.device.manufacturer} ${event.device.product}: ${event.text}}`;
        term.writeln(str);
      });
      const id = 'terminal';
      const terminalEl = document.getElementById(id);
      if (terminalEl === null) {
        console.error(
          chalk`{redBright.bold.bgGreen XAP: xterm not initialized. unable to find element id ${id}}`
        );
      } else {
        initTerminal(terminalEl);
        term.writeln(chalk`{greenBright QMK XAP console initialized}`);
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
