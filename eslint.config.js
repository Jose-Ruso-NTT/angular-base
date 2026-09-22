// @ts-check
const eslint = require('@eslint/js');
const path = require('node:path');
const { defineConfig, globalIgnores } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-config-prettier');
const jsdoc = require('eslint-plugin-jsdoc');

/**
 * @param {string} filePath
 * @returns {string | undefined}
 */
const featureNameFromPath = (filePath) => {
  const match = filePath.replaceAll('\\', '/').match(/\/src\/app\/features\/([^/]+)/u);
  return match?.[1];
};

/**
 * @param {string} source
 * @param {string} filename
 * @returns {string | undefined}
 */
const featureNameFromImport = (source, filename) => {
  const aliasMatch = source.match(/^(?:@features|@app\/features|src\/app\/features)\/([^/]+)/u);
  if (aliasMatch) {
    return aliasMatch[1];
  }

  return source.startsWith('.')
    ? featureNameFromPath(path.resolve(path.dirname(filename), source))
    : undefined;
};

/** @type {import('eslint').Rule.RuleModule} */
const noFeatureDependenciesRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevents shared/core from importing features and features from importing one another.',
    },
    schema: [],
    messages: {
      forbidden:
        'Do not import feature "{{targetFeature}}" from {{sourceLayer}}. Move the shared contract to shared/core, or keep this code inside the feature.',
    },
  },
  create(/** @type {import('eslint').Rule.RuleContext} */ context) {
    const sourceFilename = context.filename;
    const sourceFeature = featureNameFromPath(sourceFilename);
    const sourceLayer = sourceFeature
      ? `feature "${sourceFeature}"`
      : sourceFilename.includes(`${path.sep}shared${path.sep}`)
        ? 'shared'
        : 'core';

    /**
     * @param {import('estree').ImportDeclaration | import('estree').ExportAllDeclaration | import('estree').ExportNamedDeclaration} node
     */
    const validateImport = (node) => {
      const sourceNode = node.source;
      if (!sourceNode || typeof sourceNode.value !== 'string') {
        return;
      }

      const targetFeature = featureNameFromImport(sourceNode.value, sourceFilename);
      if (targetFeature && targetFeature !== sourceFeature) {
        context.report({
          node: sourceNode,
          messageId: 'forbidden',
          data: { sourceLayer, targetFeature },
        });
      }
    };

    return {
      ImportDeclaration: validateImport,
      ExportAllDeclaration: validateImport,
      ExportNamedDeclaration: validateImport,
    };
  },
};

const architecture = {
  rules: {
    'no-feature-dependencies': noFeatureDependenciesRule,
  },
};

module.exports = defineConfig([
  // Orval recreates these files from the OpenAPI contract; lint only code we own.
  globalIgnores(['src/app/core/api/generated/**']),
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
  {
    // Dependencies flow from features to shared/core, never in the opposite direction or across features.
    files: ['src/app/{core,shared,features}/**/*.ts'],
    plugins: { architecture },
    rules: {
      'architecture/no-feature-dependencies': 'error',
    },
  },
]);
