const baseConfig = require('@asva-labs-assessment/prettier-config')

module.exports = {
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), 'prettier-plugin-tailwindcss']
}
