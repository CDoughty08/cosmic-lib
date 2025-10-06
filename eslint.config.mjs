import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
const cfg = defineConfig(
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  // Global ignores
  {
    ignores: ['**/dist/', '**/node_modules/', '**/*.js']
  },
  {
    languageOptions: {
      globals: {
        ...globals.node
      },
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier
    }
  },
  {
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },
  // Configuration for tsup config files
  {
    files: ['packages/**/tsup.config.ts']
  },

  // Configuration for test files
  {
    files: ['packages/**/*.{test,spec}.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    }
  },

  // Base configuration for TypeScript files in packages (excluding test files)
  {
    files: ['packages/*/src/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**/*']
  }
);

export default cfg;
