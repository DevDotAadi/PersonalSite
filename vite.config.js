import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        now: resolve(__dirname, 'now.html'),
        built: resolve(__dirname, 'built.html'),
        writing: resolve(__dirname, 'writing.html'),
        elsewhere: resolve(__dirname, 'elsewhere.html'),
        essaySearch: resolve(__dirname, 'writing/search-to-recommendations.html'),
        essayVisibility: resolve(__dirname, 'writing/ai-visibility.html'),
        essayHuman: resolve(__dirname, 'writing/human-websites.html'),
      },
    },
  },
});
