import { gatherFileInPath, injectTextInHtmlPage } from './vite.core.js';

/** @param options {{ path: string, at: 'head' | 'body' | 'body-pre' }} */
export function injectFilesInIndexHtml(options) {
  let config;
  return {
    name: 'inject-files-in-index-html',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const data = gatherFileInPath(options.path, config.root, (txt, _, ext) => {
          switch (ext) {
            case 'css':
              return `<style>${txt}</style>`;
            case 'js':
              return `<script>${txt}</script>`;
            case 'html':
              return txt.toString();
            default:
              return '';
          }
        }).map(x => x.content).join('');
        return injectTextInHtmlPage(html, data, options.at);
      },
    },
  };
}
