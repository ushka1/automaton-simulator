import fs from 'fs';
import path from 'path';
import url from 'url';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Custom Vite Plugin for importing HTML partials into the index.html file.
 *
 * This plugin searches for HTML comments of the form <!-- @import 'path/to/filename.ext' -->
 * in the index.html file and replaces them with the content of the specified file.
 *
 * @type {import('vite').Plugin}
 */
const importHtmlPartialsPlugin = {
  name: 'import-html-partials',
  transformIndexHtml(html) {
    let transformedHtml = html;

    const regex = /<!-- @import '(.+)' -->/;
    const globalRegex = /<!-- @import '(.+)' -->/g;

    const matches = transformedHtml.match(globalRegex);
    if (matches) {
      for (const m of matches) {
        const filePath = m.match(regex)[1];
        const absolutePath = path.resolve(__dirname, filePath);

        try {
          const fileContent = fs.readFileSync(absolutePath, 'utf-8');
          transformedHtml = transformedHtml.replace(m, fileContent);
        } catch (error) {
          console.error(`Error importing file ${filePath}: ${error.message}`);
        }
      }
    }

    return transformedHtml;
  },
};

export default defineConfig({
  plugins: [eslint(), importHtmlPartialsPlugin],
  server: {
    port: 3000,
    hmr: true,
  },
});
