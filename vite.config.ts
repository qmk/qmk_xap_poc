import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import WindiCSS from 'vite-plugin-windicss';
import Components from 'vite-plugin-components';
import ViteIcons from 'vite-plugin-icons';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.ELECTRON == 'true' ? './' : '.',
  plugins: [vue(), WindiCSS(), Components(), ViteIcons()],
});
