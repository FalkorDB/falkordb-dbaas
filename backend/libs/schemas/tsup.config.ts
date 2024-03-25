import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  sourcemap: true,
  format: ['cjs', 'esm'],
  entryPoints: ['src/index.ts'],
}));
