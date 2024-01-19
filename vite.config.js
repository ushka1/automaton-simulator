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
 * This plugin searches for HTML comments of the form <!-- @include 'path/to/filename.ext' -->
 * in the index.html file and replaces them with the content of the specified file.
 */
const importHtmlPartialsPlugin = () => {
  /**
   * @type {import('vite').ResolvedConfig}
   */
  let config;

  /**
   * @type {import('vite').Plugin}
   */
  const plugin = {
    name: 'import-html-partials',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    transformIndexHtml(html) {
      let transformedHtml = html;

      const regex = /<!-- @include '(.+)' -->/;
      const globalRegex = /<!-- @include '(.+)' -->/g;

      const matches = transformedHtml.match(globalRegex);
      if (!matches) {
        return transformedHtml;
      }

      for (const match of matches) {
        const filePath = match.match(regex)[1];
        let absolutePath;

        // Check if the file path matches any of the aliases defined in vite.config.js.
        const aliases = config.resolve.alias;
        for (const alias in aliases) {
          const { find, replacement } = aliases[alias];
          if (filePath.match(find)) {
            absolutePath = filePath.replace(find, replacement);
          }
        }

        // If the file path is not an alias, resolve it relative to the vite.config.js file.
        if (!absolutePath) {
          absolutePath = path.resolve(__dirname, filePath);
        }

        // Read the file content and replace the HTML comment with it.
        try {
          const fileContent = fs.readFileSync(absolutePath, 'utf-8');
          transformedHtml = transformedHtml.replace(match, fileContent);
        } catch (error) {
          console.error(`Error importing file ${filePath}: ${error.message}`);
        }
      }

      return transformedHtml;
    },
  };

  return plugin;
};

export default defineConfig({
  base: '/automaton-simulator/',
  plugins: [eslint(), importHtmlPartialsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@css': path.resolve(__dirname, 'src/assets/css'),
      '@html': path.resolve(__dirname, 'src/assets/html'),
    },
  },
  server: {
    port: 3000,
    hmr: true,
  },
});
