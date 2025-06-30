import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Import path module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Setup path alias for '@/*'
    },
  },
  server: {
    port: 3000, // Frontend dev server port
    proxy: {
      // Proxy API requests to the backend server
      '/api': {
        target: 'http://localhost:5001', // Your backend server address
        changeOrigin: true,
        // secure: false, // Uncomment if your backend is not using HTTPS in dev
        // rewrite: (path) => path.replace(/^\/api/, ''), // If your backend doesn't expect /api prefix
      },
    },
  },
  build: {
    outDir: 'dist/client', // Output directory for frontend build
    rollupOptions: {
      // Additional Rollup options if needed
    },
  },
});
