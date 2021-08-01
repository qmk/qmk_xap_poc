<template>
  <XapClient />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import XapClient from './components/XapClient.vue';

export default defineComponent({
  name: 'App',
  components: {
    XapClient,
  },
});
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

* {
  box-sizing: border-box;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
}
</style>
