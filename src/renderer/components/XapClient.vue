<template>
  <div id="xap-client">
    <NavBar :configs="tabconfigs" @tab-change-event="updateTabConfigs" />
    <HidListen />
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import NavBar, { TabConfig } from './NavBar.vue';
import HidListen from './HidListen.vue';
export default defineComponent({
  name: 'XapClient',
  setup: () => {
    const tabconfigs = ref([
      { displayText: 'Firmware Flashing', hasCount: false },
      { displayText: 'Keymap Configuration', hasCount: false },
      { displayText: 'Console Output', hasCount: true, active: true },
    ] as Array<TabConfig>);

    function updateTabConfigs(index: number) {
      const active = tabconfigs.value.find((config) => config.active === true);
      if (active) {
        active.active = false;
      }
      tabconfigs.value[index].active = true;
    }

    return { tabconfigs, updateTabConfigs };
  },
  components: {
    NavBar,
    HidListen,
  },
});
</script>

<style scoped>
#xap-client {
  display: flex;
  flex-flow: column;
  width: 100%;
  height: 100%;
}
</style>
