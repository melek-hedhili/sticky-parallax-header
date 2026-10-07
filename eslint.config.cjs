const reactNative = require('@react-native/eslint-config/flat');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const prettier = require('eslint-config-prettier');
const importPlugin = require('eslint-plugin-import');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  {
    ignores: [
      '.agents/**',
      '.claude/**',
      '**/node_modules/**',
      'lib/**',
      '**/build/**',
      '**/dist/**',
      'docs/.docusaurus/**',
      '**/.expo/**',
      'demo/expo-env.d.ts',
      'demo/ios/**',
      'demo/android/**',
    ],
  },
  ...reactNative.filter((config) => !config.plugins?.['ft-flow']),
  {
    files: ['jest/**/*.js'],
    languageOptions: { globals: { jest: 'readonly' } },
  },
  {
    files: ['**/*.{js,cjs,mjs,ts,tsx}'],
    plugins: { import: importPlugin, prettier: prettierPlugin },
    rules: {
      'arrow-parens': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'import/order': [
        'error',
        {
          'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          'alphabetize': {
            order: 'asc',
          },
        },
      ],
      'lines-between-class-members': 'error',
      'no-alert': 'error',
      'no-console': [
        'error',
        {
          allow: ['warn', 'error'],
        },
      ],
      'no-debugger': 'error',
      'no-multiple-empty-lines': 'error',
      'no-underscore-dangle': 'error',
      'no-unused-vars': 'off',
      'no-var': 'error',
      'newline-before-return': 'error',
      'quote-props': ['error', 'consistent-as-needed'],
      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: 'function',
          next: '*',
        },
        {
          blankLine: 'always',
          prev: 'block-like',
          next: '*',
        },
        {
          blankLine: 'always',
          prev: 'class',
          next: '*',
        },
        {
          blankLine: 'always',
          prev: '*',
          next: 'class',
        },
        {
          blankLine: 'always',
          prev: ['const', 'let', 'var'],
          next: '*',
        },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
      ],
      'prefer-const': 'error',
      'prettier/prettier': [
        'error',
        {
          printWidth: 100,
          quoteProps: 'consistent',
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
          useTabs: false,
        },
      ],
      'react/display-name': 'off',
      'react/prop-types': 'off',
      'react-hooks/exhaustive-deps': [
        'error',
        {
          additionalHooks: '(useAnimatedStyle|useDerivedValue|useAnimatedProps)',
        },
      ],
      'react-native/no-color-literals': 'warn',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-unused-styles': 'warn',
      'react-native/split-platform-components': 2,
      'semi': ['error', 'always'],
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    plugins: { '@typescript-eslint': typescriptPlugin },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  prettier,
];
