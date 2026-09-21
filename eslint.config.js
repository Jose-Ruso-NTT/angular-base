// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-config-prettier');
const jsdoc = require('eslint-plugin-jsdoc');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    // Enable typed linting via the typescript-eslint Project Service.
    // This is slower than untyped linting; see https://typescript-eslint.io/getting-started/typed-linting
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      angular.configs.tsRecommended,
      prettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      'jsdoc/require-jsdoc': [
        'error',
        {
          contexts: [
            'PropertyDefinition:has(CallExpression[callee.name="input"])',
            'PropertyDefinition:has(CallExpression[callee.object.name="input"])',
            'PropertyDefinition:has(CallExpression[callee.name="output"])',
            'PropertyDefinition:has(CallExpression[callee.object.name="output"])',
            'PropertyDefinition:has(CallExpression[callee.name="model"])',
            'PropertyDefinition:has(CallExpression[callee.object.name="model"])',
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
          ],
          publicOnly: {
            ancestorsOnly: true,
            cjs: false,
            esm: true,
            window: false,
          },
        },
      ],
      'jsdoc/require-description': 'error',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
    plugins: {
      jsdoc,
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
