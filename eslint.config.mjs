import tseslint from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
        ecmaVersion: 2020
      }
    },
    plugins: {
      "@typescript-eslint": tseslint
    },
    rules: {
      ...tseslint.configs.recommended.rules
    }
  },
  {
    ignores: ["dist/**", "node_modules/**"]
  },
  {
    rules: {
      "no-console": "warn",
      "dot-notation": "error",
      "no-else-return": "error",
      "curly": "error",
      "prefer-const": "error",
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
]
