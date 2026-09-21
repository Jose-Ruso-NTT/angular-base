import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: './swagger/api.yaml',
    },
    output: {
      client: 'angular',
      mode: 'tags-split',
      target: './src/app/core/api/generated/client.ts',
      schemas: {
        type: 'zod',
        path: './src/app/core/api/generated/schemas',
      },
      override: {
        angular: {
          baseUrl: {
            apiId: 'angularBase',
          },
          retrievalClient: 'httpResource',
          runtimeValidation: true,
        },
        zod: {
          variant: 'mini',
          version: 4,
        },
      },
    },
  },
});
