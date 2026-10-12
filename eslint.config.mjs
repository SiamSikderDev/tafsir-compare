import { defineConfig, globalIgnores } from "eslint/config";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

const nextCoreWebVitals =
  // CJS/ESM interop: the plugin may expose flatConfig on default or root.
  nextPlugin?.flatConfig?.coreWebVitals ??
  nextPlugin?.default?.flatConfig?.coreWebVitals;

if (!nextCoreWebVitals) {
  throw new Error("Could not load @next/eslint-plugin-next flat config");
}

export default defineConfig([
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  nextCoreWebVitals,
  ...tseslint.configs.recommended,
]);
