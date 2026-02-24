import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lpa: {
          bg: "rgb(var(--lpa-bg) / <alpha-value>)",
          fg: "rgb(var(--lpa-fg) / <alpha-value>)",
          mutedFg: "rgb(var(--lpa-muted-fg) / <alpha-value>)",
          card: "rgb(var(--lpa-card) / <alpha-value>)",
          cardBorder: "rgb(var(--lpa-card-border) / <alpha-value>)",

          primary: "rgb(var(--lpa-primary) / <alpha-value>)",
          secondary: "rgb(var(--lpa-secondary) / <alpha-value>)",
          accent: "rgb(var(--lpa-accent) / <alpha-value>)",
          black: "rgb(var(--lpa-black) / <alpha-value>)",
          white: "rgb(var(--lpa-white) / <alpha-value>)",
        },
      },
      borderRadius: {
        lpa: "var(--lpa-radius-md)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
