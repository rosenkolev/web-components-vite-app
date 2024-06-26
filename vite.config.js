import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

/** @param options {{ path: string, at: 'head' | 'body' | 'body-pre', exclude: [] }} */
function injectFilesInIndexHtml(options) {
  let config;
  return {
    name: 'inject-files-in-index-html',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const isDirectory = options.path.endsWith('/') || !options.path.split('/').pop().includes('.');
        const basePath = isDirectory ? path.resolve(config.root, options.path) : config.root;
        const files = isDirectory ? fs.readdirSync(basePath) : [options.path];
        const excludes = options.exclude && options.exclude.map(x => new RegExp(x, 'gm')) || [];
        const filesContent = files.filter(file => !excludes.some(x => x.test(file))).map((file) => {
          console.log('file', file);
          const pathToFile = path.resolve(basePath, file);
          const txt = fs.readFileSync(pathToFile);

          switch (file.split('.').pop()) {
            case 'css':
              return `<style>${txt}</style>`;
            case 'js':
              return `<script>${txt}</script>`;
            case 'html':
              return txt.toString();
            default:
              return '';
          }
        });

        const data = filesContent.join('');
        switch (options.at) {
          case 'head':
            return html.replace('</head>', `${data}\n</head>`);
          case 'body':
            return html.replace('</body>', `${data}\n</body>`);
          case 'body-pre':
            return html.replace('<body>', `<body>\n${data}`);
        }
      },
    },
  };
}

export default defineConfig({
  base: '/web-components-vite-app',
  test: { environment: "happy-dom" },
  resolve: {
    alias: {
      'core': path.resolve(__dirname, 'core.js'),
    }
  },
  plugins: [
    injectFilesInIndexHtml({ path: 'components/', at: 'body-pre', exclude: ['\.js$'] }),
    injectBasePath()
  ],
});

function injectBasePath() {
  let basePath = '/';
  return {
    name: 'inject-base-path',
    configResolved(config) {
      basePath = config.base;
    },
    transformIndexHtml(html) {
      return html.replace(/<base href="\/?"\s*\/?>/, `<base href="${basePath}" />`);
    },
  };
}