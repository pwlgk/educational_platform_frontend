// .eslintrc.cjs
/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    // Добавьте эту строку в конец:
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  // Можно добавить правила prettier как правила eslint, если нужно
  // rules: {
  //   'prettier/prettier': 'warn',
  // },
};