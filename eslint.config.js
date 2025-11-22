import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        sourceType: 'module',
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      quotes: ['error', 'single'],
      'import/no-unresolved': 'off',
      'linebreak-style': ['error', 'unix'],
      indent: 'off',
      'object-curly-spacing': 'off',
      'no-tabs': 'off',
      'max-len': 'off',
      'require-jsdoc': 'off',
      'no-empty': ['off'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-mixed-spaces-and-tabs': 'off',
      camelcase: 'off',
    },
  },
  {
    ignores: ['dist/**/*', 'node_modules/**/*', 'migrations/*'],
  },
);
