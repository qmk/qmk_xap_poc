<template>
  <XapClient />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import XapClient from "./components/XapClient.vue";

export default defineComponent({
  name: "App",
  components: {
    XapClient,
  },
});
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0.6em;
}
</style>
