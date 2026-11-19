import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import jest from 'eslint-plugin-jest';
import sonarjs from 'eslint-plugin-sonarjs';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', '**/*.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  sonarjs.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      complexity: ['warn', 5],
      'max-lines-per-function': ['warn', 25],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'sonarjs/cognitive-complexity': ['warn', 5],
      'sonarjs/no-duplicate-string': 'warn',
    },
  },
  {
    files: ['test/**/*.ts'],
    ...jest.configs['flat/recommended'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/no-disabled-tests': 'error',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/valid-expect': 'error',
      'max-lines-per-function': 'off',
      'jest/no-conditional-expect': 'off',
      'jest/valid-title': 'off',
      'sonarjs/prefer-specific-assertions': 'off',
      'sonarjs/no-ignored-exceptions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  prettierRecommended,
);
