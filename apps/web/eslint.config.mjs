import baseConfig from '@asva-labs-assessment/eslint-config/base.js'
import reactConfig from '@asva-labs-assessment/eslint-config/react.js'
import { defineConfig, globalIgnores } from 'eslint/config'

const eslintPluginNext = await import('@next/eslint-plugin-next').then(m => m.default ?? m)

export default defineConfig([
  // Global ignore patterns
  globalIgnores(['**/*.d.ts', '**/*.js', '**/*.config.mjs', 'node_modules/', 'public/', '.next/', 'out/', 'build/']),

  // Base TypeScript linting
  ...baseConfig,

  // React/Next-specific rules
  ...reactConfig,

  {
    ignores: ['**/node_modules/**', '**/.next/**', '**/*.config.js', '**/*.cjs', '**/*.mjs'],
    files: ['**/*.ts', '**/*.tsx', '**/*.jsx', '**/*.js'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      '@next/next': eslintPluginNext
    },
    rules: {
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'error'
    }
  }
])
