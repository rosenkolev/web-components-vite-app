# Wec Components Application

An web application using only browser native technologies and no frameworks.

`fast` `web components` `browser native` `HTML template based` `vite`

This application demonstrate that the bowser's have evolved to support complex application without external dependecies.

# Component

The entire source code a component is in a single file (e.g. `home-page.component.html`).

```html
<template id="home-page">
  <h2>Home Page</h2>
</template>
<script>
  class HomePage extends CustomElement {
    static component = Object.freeze({
      selector: 'home-page'
    });
  };
  HomePage.componentInit();
</script>
```

# index.html

All html files will be bundled into the `index.html` file.

```html
<!-- index.html-->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SPA WC Vite</title>
    <script>window.DEBUG_CUSTOM_ELEMENTS=true</script>
    <!-- core.js will be injected here-->
  </head>
  <body>
    <!-- components will be injected here -->
    <app-root></app-root>
  </body>
</html>
```

# Vite

Vite is used only for bundeling files. In reality `vite` is not needed and can be done with a simple NodeJs script.

`package.json`
```json
{
  "scripts": {
    "start": "vite",
    "build": "vite build"
  },
  "devDependencies": {
    "vite": "5.1.7"
  }
}
```

```javascript
// vite.config.js
/** @param options {{ path: string, at: 'head' | 'body' | 'body-pre' }} */
function injectFilesInIndexHtml(options) {
  return {
    name: 'inject-files-in-index-html',
    transformIndexHtml: {
      transform(html) {
        /** ... */
        const isDirectory = options.path...;
        const files = isDirectory ? fs.readdirSync(basePath) : [options.path];
        const filesContent = files.map((file) => {
          const pathToFile = path.resolve(basePath, file);
          const txt = fs.readFileSync(pathToFile);
          switch (file.split('.').pop()) {
            /** ... */
            case 'html':
              return txt.toString();
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
  plugins: [
    injectFilesInIndexHtml({ path: 'core.js', at: 'head' }),
    injectFilesInIndexHtml({ path: 'components/', at: 'body-pre' }),
  ],
});
```
