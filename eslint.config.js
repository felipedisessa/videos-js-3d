import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'build/', 'modelos/', 'saida/'] },
  js.configs.recommended,
  {
    files: ['src/**/*.mjs', 'test/**/*.mjs', 'roteiros/**/*.mjs', '*.js'],
    languageOptions: { ecmaVersion: 2025, sourceType: 'module', globals: globals.node },
  },
  {
    files: ['web/**/*.js'],
    languageOptions: { ecmaVersion: 2025, sourceType: 'module', globals: globals.browser },
  },
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },
];
