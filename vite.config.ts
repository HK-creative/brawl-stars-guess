/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts', // Optional: if you need setup files
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      all: true, // Ensure all files are considered for coverage, not just tested ones
      include: ['src/lib/**/*.ts', 'src/stores/**/*.ts', 'src/components/**/*.tsx', 'src/pages/**/*.tsx'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/test/',
        '**/*.test.ts',
        '**/*.test.tsx',
        'src/interfaces/', // if you have a dedicated interfaces folder
        'src/types/', // if you have a dedicated types folder
        'src/App.tsx', // Usually App.tsx has a lot of setup, less unit testable logic
        'src/contexts/**', // Contexts often have simple providers
        // exclude storybook files if any
        '**/*.stories.tsx',
        '**/*.stories.ts',
      ]
    },
  },
}));
