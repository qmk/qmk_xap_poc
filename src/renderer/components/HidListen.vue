<template>
  <div id="terminal"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';

import { term, chalk, initTerminal, resizeWindow } from './console';

export default defineComponent({
  name: 'HidListen',
  setup() {
    onMounted(() => {
      const id = 'terminal';
      const terminalEl = document.getElementById(id);
      if (terminalEl === null) {
        console.error(chalk`{redBright.bold.bgGreen XAP: xterm not initialized. unable to find element id ${id}}`);
      } else {
        initTerminal(terminalEl);
        resizeWindow();
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
