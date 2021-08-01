// windi.config.ts
import { defineConfig, transform } from "windicss/helpers";

export default defineConfig({
  darkMode: "media",
  plugins: [transform("daisyui")],
});
