import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  important: "#ai-preview",

  theme: {
    extend: {},
  },

  plugins: [],
};

export default config;