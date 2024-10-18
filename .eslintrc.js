module.exports = {
  root: true,
  extends: ['alloy', 'alloy/typescript', 'plugin:vue/vue3-recommended'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
  rules: {
    'vue/html-indent': ['warn', 2],

    'no-unused-vars': ['warn'],
    // make possible `/// <reference...`
    'spaced-comment': ['error', 'always', { markers: ['/'] }],
    'no-undef': ['off'],
    '@typescript-eslint/no-unused-vars': ['off'],
    '@typescript-eslint/explicit-member-accessibility': ['off'],
    '@typescript-eslint/no-parameter-properties': ['off'],
    '@typescript-eslint/unified-signatures': ['off'],
    'vue/v-bind-style': ['error', 'shorthand', { 'sameNameShorthand': 'always' }],
    '@typescript-eslint/member-delimiter-style': [
      'warn',
      {
        multiline: {
          delimiter: 'none',
          requireLast: false,
        },
        singleline: {
          delimiter: 'comma',
          requireLast: false,
        },
        multilineDetection: 'brackets',
      },
    ],
  },
};
