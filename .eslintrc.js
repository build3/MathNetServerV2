module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    mocha: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
      "indent": ["error", 4],
      // Get rid of errors containing _id field from mongoDB.
      "no-underscore-dangle": ['error', {'allow': ['_id', ]}]
  },
};
