import nodeConfig from '@asva-labs-assessment/eslint-config/node.js'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nodeConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      }
    }
  }
]
