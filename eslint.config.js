// eslint.config.js
const typescriptPlugin = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");
const prettierPlugin = require("eslint-plugin-prettier");

module.exports = [
  {
    files: ["src/**/*.{js,ts}"],
    ignores: [
      ".vscode/**",
      ".github/**",
      "package.json",
      "node_modules/**",
      "dist/**",
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Prettier rules
      "prettier/prettier": "error",

      // TypeScript rules
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-empty-object-type": "off",
      // ESLint rules
      "no-use-before-define": "warn",
      // ESLint-config-standard overrides
      "comma-dangle": "off",
      "no-global-assign": "off",
      quotes: "off",
      "space-before-function-paren": "off",
    },
  },
];
