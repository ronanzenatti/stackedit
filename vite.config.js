import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'mock-imsize',
      enforce: 'pre',
      resolveId(source, importer) {
        if (source.endsWith('imsize') && importer && importer.includes('markdown-it-imsize')) {
          return path.resolve(__dirname, './src/mocks/image-size.js');
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'punycode': 'punycode/'
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  server: {
    port: 8080
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div', 'if-function']
      }
    }
  }
})
