import { defineConfig } from 'eslint/config'
import obsidianmd from 'eslint-plugin-obsidianmd'

export default defineConfig([
  ...obsidianmd.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.*'],
        },
      },
    },
  },
  {
    files: ['src/settings.ts'],
    rules: {
      // The declarative settings API requires Obsidian 1.13+. Keep display() while the manifest
      // supports 1.2.3 and the settings tab contains custom profile and notation-guide controls.
      'obsidianmd/settings-tab/prefer-setting-definitions': 'off',
    },
  },
  {
    ignores: [
      'tests/**',
      'main.js',
      'node_modules/**',
      '.github/**',
      'esbuild.config.mjs',
      'vitest.config.mts',
      'scripts/**',
    ],
  },
])
