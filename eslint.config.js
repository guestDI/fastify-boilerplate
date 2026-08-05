'use strict';

const js = require('@eslint/js');
const globals = require('globals');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  { ignores: ['node_modules/', 'coverage/'] },
  js.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: globals.jest,
    },
  },
];
