// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        varsIgnorePattern: '^_',      // biến bắt đầu bằng _ → bỏ qua
        argsIgnorePattern: '^_',      // tham số bắt đầu bằng _ → bỏ qua
        caughtErrorsIgnorePattern: '^_', // catch (e) bắt đầu bằng _ → bỏ qua
      }],
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',         // class-validator decorators
      '@typescript-eslint/no-unsafe-member-access': 'off', // class-validator decorators
      '@typescript-eslint/no-unsafe-assignment': 'off',    // class-validator decorators
      '@typescript-eslint/no-unsafe-return': 'off',        // ioredis & third-party libs
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
);
