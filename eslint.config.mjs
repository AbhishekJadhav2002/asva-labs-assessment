import eslintPluginSecurity from 'eslint-plugin-security'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { configs } from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Global ignore patterns
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.d.ts'
    ]
  },

  // Base configuration for all TypeScript files
  ...configs.recommended,
  eslintPluginUnicorn.configs.recommended,
  eslintPluginSecurity.configs.recommended,

  {
    languageOptions: {
      parser: configs.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: true,
        tsconfigRootDir: __dirname
      }
    },

    plugins: {
      'unused-imports': (await import('eslint-plugin-unused-imports')).default,
      perfectionist: (await import('eslint-plugin-perfectionist')).default,
      import: (await import('eslint-plugin-import')).default
    },

    rules: {
      // Perfectionist rules (sorting)
      'perfectionist/sort-named-imports': ['error', { type: 'alphabetical' }],
      'perfectionist/sort-named-exports': ['error', { type: 'alphabetical' }],
      'perfectionist/sort-exports': ['error', { type: 'alphabetical' }],
      'perfectionist/sort-interfaces': ['warn', { type: 'line-length' }],
      'perfectionist/sort-objects': ['warn', { type: 'line-length' }],
      'perfectionist/sort-object-types': ['error', { type: 'alphabetical' }],
      'perfectionist/sort-union-types': ['error', { type: 'alphabetical' }],

      // Security rules
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-new-buffer': 'error',
      'security/detect-no-csrf-before-method-override': 'error',

      // Import rules
      'import/first': 'warn',
      'import/no-duplicates': 'warn',
      'import/newline-after-import': 'warn',
      'import/no-unresolved': 'off',
      'unused-imports/no-unused-imports': 'warn',

      // Unicorn rules adjustments
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-static-only-class': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prefer-module': 'off',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' }
      ],
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error'
    },

    settings: {
      perfectionist: {
        partitionByComment: true,
        type: 'alphabetical'
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true
        }
      }
    }
  }
]
