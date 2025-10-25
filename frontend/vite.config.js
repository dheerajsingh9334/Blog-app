import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    cssMinify: true,
    sourcemap: false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - split by usage pattern
          'react-core': ['react', 'react-dom', 'react-router-dom'],
          'redux': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          'query': ['@tanstack/react-query'],
          'ui-icons': ['@heroicons/react', 'react-icons'],
          'forms': ['formik', 'yup'],
          'stripe': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          'editor': ['react-quill', 'quill'],
          'charts': ['recharts'],
          'markdown': ['react-markdown', 'remark-gfm', 'rehype-raw'],
          'utils': ['axios', 'react-hot-toast', 'html-to-text'],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      '@tanstack/react-query',
      'axios'
    ],
    exclude: ['@tanstack/react-query-devtools'],
  },
});
