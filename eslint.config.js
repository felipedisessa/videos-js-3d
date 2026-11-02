import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'build/', 'modelos/', 'saida/', 'projetos/'] },
  js.configs.recommended,
  {
    files: ['src/**/*.mjs', 'test/**/*.mjs', 'exemplos/**/*.mjs', '*.js'],
    languageOptions: { ecmaVersion: 2025, sourceType: 'module', globals: globals.node },
  },
  {
    files: ['web/**/*.js', 'exemplos/**/cenas.js', 'projetos/**/cenas.js'],
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
