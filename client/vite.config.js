import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import {config} from 'dotenv';

config();

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      util: 'rollup-plugin-node-polyfills/polyfills/util',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: ['buffer', 'process'],
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
    },
  },

  //server: {
  //  proxy: {
  //    '/api': 'http://192.168.12.218:8000',
  //  },
  //},
  server: {
  host: '0.0.0.0',
  port: 8000,
  proxy: {
    '/api': {
      target: process.env.SERVER_IP,
      changeOrigin: true,
    }
  }
}
})
