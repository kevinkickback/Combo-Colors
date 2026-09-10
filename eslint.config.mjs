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
