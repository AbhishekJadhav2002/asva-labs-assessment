module.exports = {
  // Import sorting configuration
  importOrder: [
    '<TYPES>^(node:)',
    '<TYPES>',
    '<TYPES>^@/(.*)$',
    '', // empty line
    '<BUILTIN_MODULES>', // Node.js built-in modules
    '<THIRD_PARTY_MODULES>', // Imports not matched by other special words or groups.
    '', // empty line
    '^@/hooks(.*)$',
    '^@/navigation(.*)$',
    '^@/translations(.*)$',
    '', // empty line
    '^@/components/atoms(.*)$',
    '^@/components/molecules(.*)$',
    '^@/components/organisms(.*)$',
    '', // empty line
    '^@/(.*)$',
    '', // empty line
    '^[.]' // relative imports
  ],
  importOrderTypeScriptVersion: '5.0.0',

  // Plugins configuration
  plugins: ['@ianvs/prettier-plugin-sort-imports'],

  // Code formatting rules
  semi: false,
  trailingComma: 'none',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',

  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        singleQuote: false
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'preserve'
      }
    }
  ]
}
