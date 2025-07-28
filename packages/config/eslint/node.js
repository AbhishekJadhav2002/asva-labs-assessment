import baseConfig from './base.js'

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      globals: {
        process: true,
        __dirname: true
      }
    },
    rules: {
      // Node.js specific rules
      'unicorn/prefer-top-level-await': 'off',
      'security/detect-child-process': 'warn' // Allow controlled child processes
    },
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
  }
]
