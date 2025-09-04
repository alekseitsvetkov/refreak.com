/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./entrypoints/**/*.{html,ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        "media-brand": "oklch(var(--media-brand) / <alpha-value>)",
        "media-focus": "oklch(var(--media-focus) / <alpha-value>)",
        "yellow-custom": "rgb(var(--color-yellow-custom))",
        "blue-custom": "rgb(var(--color-blue-custom))",
        "yellow-dark-custom": "rgb(var(--color-yellow-dark-custom))",
        "blue-dark-custom": "rgb(var(--color-blue-dark-custom))",
        "green-custom": "rgb(var(--color-green-custom))",
      },
      ringColor: {
        "media-focus": "oklch(var(--media-focus) / <alpha-value>)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@vidstack/react/tailwind.cjs")({
      prefix: "media",
    }),
    require("@tailwindcss/line-clamp"),
    customVariants,
  ],
  // Отключаем sourcemap для оптимизации
  corePlugins: {
    preflight: true,
  },
};

function customVariants({ addVariant, matchVariant }) {
  // Strict version of `.group` to help with nesting.
  matchVariant("parent-data", (value) => `.parent[data-${value}] > &`);

  addVariant("hocus", ["&:hover", "&:focus-visible"]);
  addVariant("group-hocus", [".group:hover &", ".group:focus-visible &"]);
}
