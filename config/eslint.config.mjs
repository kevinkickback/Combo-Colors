import { defineConfig } from 'eslint/config'
import obsidianmd from 'eslint-plugin-obsidianmd'

export default defineConfig([
  ...obsidianmd.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: `${import.meta.dirname}/..`,
        projectService: {
          allowDefaultProject: ['config/eslint.config.mjs'],
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
      'config/esbuild.config.mjs',
      'config/vitest.config.mts',
      'scripts/**',
    ],
  },
])
