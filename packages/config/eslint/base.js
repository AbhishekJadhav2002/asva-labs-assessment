import eslintPluginSecurity from 'eslint-plugin-security'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import { configs } from 'typescript-eslint'

const importPlugin = await import('eslint-plugin-import').then(m => m.default ?? m)
const perfectionistPlugin = await import('eslint-plugin-perfectionist').then(m => m.default ?? m)
const unusedImportsPlugin = await import('eslint-plugin-unused-imports').then(m => m.default ?? m)

export default [
  ...configs.recommended,
  eslintPluginUnicorn.configs.recommended,
  eslintPluginSecurity.configs.recommended,
  {
    plugins: {
      import: importPlugin,
      perfectionist: perfectionistPlugin,
      'unused-imports': unusedImportsPlugin
    },

    languageOptions: {
      parser: configs.parser,
      parserOptions: {
        project: true,
        sourceType: 'module',
        ecmaVersion: 'latest'
      }
    },

    rules: {
      // Base TypeScript rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' }
      ],

      // Security rules
      'security/detect-unsafe-regex': 'error',
      'security/detect-object-injection': 'error',

      // Import rules
      'import/first': 'warn',
      'import/no-duplicates': 'warn',
      'unused-imports/no-unused-imports': 'warn',

      // Unicorn adjustments
      'unicorn/filename-case': 'off',
      'unicorn/prevent-abbreviations': 'off'
    }
  }
]
