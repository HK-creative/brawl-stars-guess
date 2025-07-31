// vite.config.ts
import { defineConfig } from "file:///C:/Users/999yu/Desktop/brawl-stars-guess/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/999yu/Desktop/brawl-stars-guess/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/999yu/Desktop/brawl-stars-guess/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\999yu\\Desktop\\brawl-stars-guess";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for large third-party libraries
          vendor: ["react", "react-dom", "react-router-dom"],
          // UI library chunk
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-toast", "lucide-react"],
          // Supabase chunk
          supabase: ["@supabase/supabase-js"],
          // Game data chunk
          gameData: ["@/data/brawlers"]
        }
      }
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1e3,
    // Enable minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: mode === "production"
      }
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize assets - reduce inline limit for better caching
    assetsInlineLimit: 2048,
    // 2kb - smaller files inlined, larger files cached
    // Improve asset file naming for better caching
    assetFileNames: (assetInfo) => {
      const info = assetInfo.name.split(".");
      let extType = info[info.length - 1];
      if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
        extType = "images";
      } else if (/woff2?|eot|ttf|otf/i.test(extType)) {
        extType = "fonts";
      }
      return `assets/${extType}/[name]-[hash][extname]`;
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "zustand",
      "sonner"
    ],
    exclude: [
      // Exclude large assets that should be lazy loaded
    ]
  },
  // Image optimization settings
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg", "**/*.webp"],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    // Optional: if you need setup files
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      all: true,
      // Ensure all files are considered for coverage, not just tested ones
      include: ["src/lib/**/*.ts", "src/stores/**/*.ts", "src/components/**/*.tsx", "src/pages/**/*.tsx"],
      exclude: [
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/test/",
        "**/*.test.ts",
        "**/*.test.tsx",
        "src/interfaces/",
        // if you have a dedicated interfaces folder
        "src/types/",
        // if you have a dedicated types folder
        "src/App.tsx",
        // Usually App.tsx has a lot of setup, less unit testable logic
        "src/contexts/**",
        // Contexts often have simple providers
        // exclude storybook files if any
        "**/*.stories.tsx",
        "**/*.stories.ts"
      ]
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFw5OTl5dVxcXFxEZXNrdG9wXFxcXGJyYXdsLXN0YXJzLWd1ZXNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFw5OTl5dVxcXFxEZXNrdG9wXFxcXGJyYXdsLXN0YXJzLWd1ZXNzXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy85OTl5dS9EZXNrdG9wL2JyYXdsLXN0YXJzLWd1ZXNzL3ZpdGUuY29uZmlnLnRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiBcIjo6XCIsXHJcbiAgICBwb3J0OiA4MDgwLFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcclxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICAvLyBPcHRpbWl6ZSBidW5kbGUgc2l6ZVxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3M6IHtcclxuICAgICAgICAgIC8vIFZlbmRvciBjaHVuayBmb3IgbGFyZ2UgdGhpcmQtcGFydHkgbGlicmFyaWVzXHJcbiAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcclxuICAgICAgICAgIC8vIFVJIGxpYnJhcnkgY2h1bmtcclxuICAgICAgICAgIHVpOiBbJ0ByYWRpeC11aS9yZWFjdC1kaWFsb2cnLCAnQHJhZGl4LXVpL3JlYWN0LWRyb3Bkb3duLW1lbnUnLCAnQHJhZGl4LXVpL3JlYWN0LXRvYXN0JywgJ2x1Y2lkZS1yZWFjdCddLFxyXG4gICAgICAgICAgLy8gU3VwYWJhc2UgY2h1bmtcclxuICAgICAgICAgIHN1cGFiYXNlOiBbJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyddLFxyXG4gICAgICAgICAgLy8gR2FtZSBkYXRhIGNodW5rXHJcbiAgICAgICAgICBnYW1lRGF0YTogWydAL2RhdGEvYnJhd2xlcnMnXSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIC8vIE9wdGltaXplIGNodW5rIHNpemUgd2FybmluZ3NcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuICAgIC8vIEVuYWJsZSBtaW5pZmljYXRpb25cclxuICAgIG1pbmlmeTogJ3RlcnNlcicsXHJcbiAgICB0ZXJzZXJPcHRpb25zOiB7XHJcbiAgICAgIGNvbXByZXNzOiB7XHJcbiAgICAgICAgZHJvcF9jb25zb2xlOiBtb2RlID09PSAncHJvZHVjdGlvbicsXHJcbiAgICAgICAgZHJvcF9kZWJ1Z2dlcjogbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIC8vIEVuYWJsZSBDU1MgY29kZSBzcGxpdHRpbmdcclxuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcclxuICAgIC8vIE9wdGltaXplIGFzc2V0cyAtIHJlZHVjZSBpbmxpbmUgbGltaXQgZm9yIGJldHRlciBjYWNoaW5nXHJcbiAgICBhc3NldHNJbmxpbmVMaW1pdDogMjA0OCwgLy8gMmtiIC0gc21hbGxlciBmaWxlcyBpbmxpbmVkLCBsYXJnZXIgZmlsZXMgY2FjaGVkXHJcbiAgICAvLyBJbXByb3ZlIGFzc2V0IGZpbGUgbmFtaW5nIGZvciBiZXR0ZXIgY2FjaGluZ1xyXG4gICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm86IHsgbmFtZTogc3RyaW5nIH0pID0+IHtcclxuICAgICAgY29uc3QgaW5mbyA9IGFzc2V0SW5mby5uYW1lLnNwbGl0KCcuJyk7XHJcbiAgICAgIGxldCBleHRUeXBlID0gaW5mb1tpbmZvLmxlbmd0aCAtIDFdO1xyXG4gICAgICBcclxuICAgICAgLy8gR3JvdXAgYXNzZXRzIGJ5IHR5cGUgZm9yIGJldHRlciBjYWNoaW5nXHJcbiAgICAgIGlmICgvcG5nfGpwZT9nfHN2Z3xnaWZ8dGlmZnxibXB8aWNvL2kudGVzdChleHRUeXBlKSkge1xyXG4gICAgICAgIGV4dFR5cGUgPSAnaW1hZ2VzJztcclxuICAgICAgfSBlbHNlIGlmICgvd29mZjI/fGVvdHx0dGZ8b3RmL2kudGVzdChleHRUeXBlKSkge1xyXG4gICAgICAgIGV4dFR5cGUgPSAnZm9udHMnO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICByZXR1cm4gYGFzc2V0cy8ke2V4dFR5cGV9L1tuYW1lXS1baGFzaF1bZXh0bmFtZV1gO1xyXG4gICAgfSxcclxuICB9LFxyXG4gIC8vIE9wdGltaXplIGRlcGVuZGVuY2llc1xyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgaW5jbHVkZTogW1xyXG4gICAgICAncmVhY3QnLFxyXG4gICAgICAncmVhY3QtZG9tJyxcclxuICAgICAgJ3JlYWN0LXJvdXRlci1kb20nLFxyXG4gICAgICAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJyxcclxuICAgICAgJ3p1c3RhbmQnLFxyXG4gICAgICAnc29ubmVyJyxcclxuICAgIF0sXHJcbiAgICBleGNsdWRlOiBbXHJcbiAgICAgIC8vIEV4Y2x1ZGUgbGFyZ2UgYXNzZXRzIHRoYXQgc2hvdWxkIGJlIGxhenkgbG9hZGVkXHJcbiAgICBdLFxyXG4gIH0sXHJcbiAgLy8gSW1hZ2Ugb3B0aW1pemF0aW9uIHNldHRpbmdzXHJcbiAgYXNzZXRzSW5jbHVkZTogWycqKi8qLnBuZycsICcqKi8qLmpwZycsICcqKi8qLmpwZWcnLCAnKiovKi5naWYnLCAnKiovKi5zdmcnLCAnKiovKi53ZWJwJ10sXHJcbiAgdGVzdDoge1xyXG4gICAgZ2xvYmFsczogdHJ1ZSxcclxuICAgIGVudmlyb25tZW50OiAnanNkb20nLFxyXG4gICAgc2V0dXBGaWxlczogJy4vc3JjL3Rlc3Qvc2V0dXAudHMnLCAvLyBPcHRpb25hbDogaWYgeW91IG5lZWQgc2V0dXAgZmlsZXNcclxuICAgIGNvdmVyYWdlOiB7XHJcbiAgICAgIHByb3ZpZGVyOiAndjgnLFxyXG4gICAgICByZXBvcnRlcjogWyd0ZXh0JywgJ2pzb24nLCAnaHRtbCddLFxyXG4gICAgICByZXBvcnRzRGlyZWN0b3J5OiAnLi9jb3ZlcmFnZScsXHJcbiAgICAgIGFsbDogdHJ1ZSwgLy8gRW5zdXJlIGFsbCBmaWxlcyBhcmUgY29uc2lkZXJlZCBmb3IgY292ZXJhZ2UsIG5vdCBqdXN0IHRlc3RlZCBvbmVzXHJcbiAgICAgIGluY2x1ZGU6IFsnc3JjL2xpYi8qKi8qLnRzJywgJ3NyYy9zdG9yZXMvKiovKi50cycsICdzcmMvY29tcG9uZW50cy8qKi8qLnRzeCcsICdzcmMvcGFnZXMvKiovKi50c3gnXSxcclxuICAgICAgZXhjbHVkZTogW1xyXG4gICAgICAgICdzcmMvbWFpbi50c3gnLFxyXG4gICAgICAgICdzcmMvdml0ZS1lbnYuZC50cycsXHJcbiAgICAgICAgJ3NyYy90ZXN0LycsXHJcbiAgICAgICAgJyoqLyoudGVzdC50cycsXHJcbiAgICAgICAgJyoqLyoudGVzdC50c3gnLFxyXG4gICAgICAgICdzcmMvaW50ZXJmYWNlcy8nLCAvLyBpZiB5b3UgaGF2ZSBhIGRlZGljYXRlZCBpbnRlcmZhY2VzIGZvbGRlclxyXG4gICAgICAgICdzcmMvdHlwZXMvJywgLy8gaWYgeW91IGhhdmUgYSBkZWRpY2F0ZWQgdHlwZXMgZm9sZGVyXHJcbiAgICAgICAgJ3NyYy9BcHAudHN4JywgLy8gVXN1YWxseSBBcHAudHN4IGhhcyBhIGxvdCBvZiBzZXR1cCwgbGVzcyB1bml0IHRlc3RhYmxlIGxvZ2ljXHJcbiAgICAgICAgJ3NyYy9jb250ZXh0cy8qKicsIC8vIENvbnRleHRzIG9mdGVuIGhhdmUgc2ltcGxlIHByb3ZpZGVyc1xyXG4gICAgICAgIC8vIGV4Y2x1ZGUgc3Rvcnlib29rIGZpbGVzIGlmIGFueVxyXG4gICAgICAgICcqKi8qLnN0b3JpZXMudHN4JyxcclxuICAgICAgICAnKiovKi5zdG9yaWVzLnRzJyxcclxuICAgICAgXVxyXG4gICAgfSxcclxuICB9LFxyXG59KSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSmhDLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQ1QsZ0JBQWdCO0FBQUEsRUFDbEIsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFBQSxJQUVMLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQTtBQUFBLFVBRVosUUFBUSxDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQTtBQUFBLFVBRWpELElBQUksQ0FBQywwQkFBMEIsaUNBQWlDLHlCQUF5QixjQUFjO0FBQUE7QUFBQSxVQUV2RyxVQUFVLENBQUMsdUJBQXVCO0FBQUE7QUFBQSxVQUVsQyxVQUFVLENBQUMsaUJBQWlCO0FBQUEsUUFDOUI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSx1QkFBdUI7QUFBQTtBQUFBLElBRXZCLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxNQUNiLFVBQVU7QUFBQSxRQUNSLGNBQWMsU0FBUztBQUFBLFFBQ3ZCLGVBQWUsU0FBUztBQUFBLE1BQzFCO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxjQUFjO0FBQUE7QUFBQSxJQUVkLG1CQUFtQjtBQUFBO0FBQUE7QUFBQSxJQUVuQixnQkFBZ0IsQ0FBQyxjQUFnQztBQUMvQyxZQUFNLE9BQU8sVUFBVSxLQUFLLE1BQU0sR0FBRztBQUNyQyxVQUFJLFVBQVUsS0FBSyxLQUFLLFNBQVMsQ0FBQztBQUdsQyxVQUFJLGtDQUFrQyxLQUFLLE9BQU8sR0FBRztBQUNuRCxrQkFBVTtBQUFBLE1BQ1osV0FBVyxzQkFBc0IsS0FBSyxPQUFPLEdBQUc7QUFDOUMsa0JBQVU7QUFBQSxNQUNaO0FBRUEsYUFBTyxVQUFVLE9BQU87QUFBQSxJQUMxQjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBRUEsY0FBYztBQUFBLElBQ1osU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQTtBQUFBLElBRVQ7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUVBLGVBQWUsQ0FBQyxZQUFZLFlBQVksYUFBYSxZQUFZLFlBQVksV0FBVztBQUFBLEVBQ3hGLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQTtBQUFBLElBQ1osVUFBVTtBQUFBLE1BQ1IsVUFBVTtBQUFBLE1BQ1YsVUFBVSxDQUFDLFFBQVEsUUFBUSxNQUFNO0FBQUEsTUFDakMsa0JBQWtCO0FBQUEsTUFDbEIsS0FBSztBQUFBO0FBQUEsTUFDTCxTQUFTLENBQUMsbUJBQW1CLHNCQUFzQiwyQkFBMkIsb0JBQW9CO0FBQUEsTUFDbEcsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBO0FBQUEsUUFDQTtBQUFBO0FBQUEsUUFDQTtBQUFBO0FBQUEsUUFDQTtBQUFBO0FBQUE7QUFBQSxRQUVBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
