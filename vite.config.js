import { defineConfig } from 'vite';
import { transpileTypescriptInHtml } from './.vite/vite.ts.compile.js';
import { injectFilesInIndexHtml } from './.vite/vite.inject-files.js';

export default defineConfig({
  base: '/web-components-vite-app',
  plugins: [
    transpileTypescriptInHtml({ path: 'components/', transpileDir: '.vite.obj' }),
    injectFilesInIndexHtml({ path: 'core.js', at: 'head' }),
    injectFilesInIndexHtml({ path: 'components/', at: 'body-pre' }),
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