import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/domain/**/*.ts',
        'src/application/**/*.ts',
        'src/controllers/**/*.ts',
        'src/infrastructure/repositories/**/*.ts',
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/index.ts',
        'src/app.ts',
        'src/types/**',
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 55,
        statements: 75,
        'src/domain/**': { lines: 90, functions: 90, branches: 85, statements: 90 },
        'src/application/**': { lines: 80, functions: 80, branches: 75, statements: 80 },
        'src/controllers/**': { lines: 70, functions: 70, branches: 35, statements: 70 },
        'src/infrastructure/repositories/**': { lines: 60, functions: 60, branches: 38, statements: 60 },
      },
    },
  },
});
