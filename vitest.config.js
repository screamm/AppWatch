import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'miniflare',
    environmentOptions: {
      modules: true,
      globals: {
        HTMLRewriter: HTMLRewriter,
        HTMLElement: HTMLElement,
        Text: Text,
        Comment: Comment,
        DocumentFragment: DocumentFragment,
      },
      scriptPath: 'src/index.js',
      d1Databases: {
        DB: 'test-db'
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        'tests/**',
        '**/*.d.ts'
      ]
    },
    testTimeout: 30000,
    setupFiles: ['./tests/setup.js']
  }
});