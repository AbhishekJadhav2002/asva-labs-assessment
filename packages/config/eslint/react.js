import baseConfig from './base.js'

const reactPlugin = await import('eslint-plugin-react').then(m => m.default ?? m)
const jsxA11yPlugin = await import('eslint-plugin-jsx-a11y').then(m => m.default ?? m)
const reactHooksPlugin = await import('eslint-plugin-react-hooks').then(m => m.default ?? m)

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.jsx', '**/*.js'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      react: reactPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'react-hooks': reactHooksPlugin
    },
    rules: {
      // React rules
      'react/prop-types': 'off', // Using TypeScript
      'react/display-name': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-key': ['error', { checkFragmentShorthand: true }],
      'react/jsx-no-target-blank': ['error', { allowReferrer: false }],

      // Accessibility rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/anchor-has-content': 'error'
    }
  }
]
