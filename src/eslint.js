module.exports = {
    root: true,
    env: {
      node: true,
      es2021: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:node/recommended',
    ],
    parserOptions: {
      ecmaVersion: 2021,
    },
    rules: {
      // Thêm các quy tắc ESLint tùy chỉnh ở đây
    },
  };