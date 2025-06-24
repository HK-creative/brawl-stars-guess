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
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for large third-party libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI library chunk
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast', 'lucide-react'],
          // Supabase chunk
          supabase: ['@supabase/supabase-js'],
          // Game data chunk
          gameData: ['@/data/brawlers'],
        },
      },
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize assets - reduce inline limit for better caching
    assetsInlineLimit: 2048, // 2kb - smaller files inlined, larger files cached
    // Improve asset file naming for better caching
    assetFileNames: (assetInfo: { name: string }) => {
      const info = assetInfo.name.split('.');
      let extType = info[info.length - 1];
      
      // Group assets by type for better caching
      if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
        extType = 'images';
      } else if (/woff2?|eot|ttf|otf/i.test(extType)) {
        extType = 'fonts';
      }
      
      return `assets/${extType}/[name]-[hash][extname]`;
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'zustand',
      'sonner',
    ],
    exclude: [
      // Exclude large assets that should be lazy loaded
    ],
  },
  // Image optimization settings
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
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
