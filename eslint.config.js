import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { noEmDash } from './eslint-rules/no-em-dash.js';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'custom': {
        rules: {
          'no-em-dash': noEmDash,
        },
      },
    },
    rules: {
      'custom/no-em-dash': 'error',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'eslint-rules/', '*.js'],
  },
);
