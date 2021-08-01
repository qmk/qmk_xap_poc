<template>
  <div class="tabs" id="navbar">
    <a
      @click="$emit('tabChangeEvent', index)"
      v-for="(tab, index) in tabs"
      :key="index"
      class="tab tab-bordered"
      :class="{ 'tab-active': tab.active }"
      >{{ tab.displayText }}
    </a>
  </div>
</template>
<script lang="ts">
export interface TabConfig {
  displayText: string; // text to display in UI
  hasCount: boolean; // has a counter
  count?: number; // current count
  active?: boolean; // is active
}
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'NavBar',
  emits: ['tabChangeEvent'],
  props: {
    configs: {
      type: Array,
      default: [],
    },
  },
  setup(prop) {
    const tabs: Array<TabConfig> = prop.configs as Array<TabConfig>;
    return { tabs };
  },
});
</script>

<style scoped>
#navbar {
  flex: 0 1 auto;
  margin-bottom: 0.6em;
}
</style>
