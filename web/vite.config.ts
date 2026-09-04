import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  test: {
    environment: 'node',
    globals: true,
  },
});
