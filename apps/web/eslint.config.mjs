// {
//   "$schema": "https://json.schemastore.org/eslintrc",
//   "root": true,
//   "extends": [
//     "next/core-web-vitals",
//     "prettier",
//     "plugin:tailwindcss/recommended"
//   ],
//   "plugins": ["tailwindcss"],
//   "rules": {
//     "@next/next/no-html-link-for-pages": "off",
//     "react/jsx-key": "off",
//     "tailwindcss/no-custom-classname": "off",
//     "tailwindcss/classnames-order": "warn"
//   },
//   "settings": {
//     "tailwindcss": {
//       "callees": ["cn"],
//       "config": "tailwind.config.js"
//     },
//     "next": {
//       "rootDir": true
//     }
//   },
//   "overrides": [
//     {
//       "files": ["*.ts", "*.tsx"],
//       "parser": "@typescript-eslint/parser"
//     }
//   ]
// }

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
