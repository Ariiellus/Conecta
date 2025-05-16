import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6", // blue-500
          dark: "#1d4ed8", // blue-700
        },
        "primary-dark": "#1d4ed8",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config; 