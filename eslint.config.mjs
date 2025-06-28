// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  // Type of the project. 'lib' for libraries, the default is 'app'
  type: 'lib',

  // Enable stylistic formatting rules
  // stylistic: true,

  // Or customize the stylistic rules
  stylistic: false,
  //  {
  //   indent: 2, // 4, or 'tab'
  //   quotes: 'single', // or 'double'
  //   jsx: true,
  //   arrowParens: false,
  // },

  // TypeScript and Vue are autodetected, you can also explicitly enable them:
  typescript: true,
  react: true,
  test: false,
  markdown: false,

  // `.eslintignore` is no longer supported in Flat config, use `ignores` instead
  ignores: ['example'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react/no-context-provider': 'off',
    'react/prefer-destructuring-assignment': 'off',
  },
})
