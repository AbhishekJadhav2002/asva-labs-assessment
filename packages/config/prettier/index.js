export default {
  semi: false,
  tabWidth: 2,
  useTabs: false,
  printWidth: 120,
  endOfLine: 'lf',
  singleQuote: true,
  bracketSpacing: true,
  arrowParens: 'avoid',
  trailingComma: 'none',
  bracketSameLine: false,

  importOrderTypeScriptVersion: '5.0.0',
  plugins: ['@ianvs/prettier-plugin-sort-imports'],

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
  ],

  importOrder: [
    '<TYPES>^(node:)',
    '<TYPES>',
    '<TYPES>^@/(.*)$',
    '',
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@/hooks(.*)$',
    '^@/navigation(.*)$',
    '^@/translations(.*)$',
    '',
    '^@/components/atoms(.*)$',
    '^@/components/molecules(.*)$',
    '^@/components/organisms(.*)$',
    '',
    '^@/(.*)$',
    '',
    '^[.]'
  ]
}
