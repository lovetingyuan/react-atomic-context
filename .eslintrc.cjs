module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'example'],
  parser: '@typescript-eslint/parser',
  rules: {
    'react-hooks/exhaustive-deps': 'error',
  },
}
