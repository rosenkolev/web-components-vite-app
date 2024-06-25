# Web Components Application

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

Use data attributes to bind and attach events.

__Example:__
- onclick event calls method onClick: `<button data-on="click:onClick('RED')">RED</button>`
- bind color property to InnerText: `<span data-bind="color"></span>`
- bind color property to css color: `<span data-css="color:color"></span>`
- bind color property to attrbiute, with default value BLACK: `<output-color color="BLACK" data-bind-color="color" />`

```html
<template id="test-page">
  <button data-on="click:onClick('RED')">RED</button>
  <button data-on="click:onClick('BLUE')">BLUE</button>
  <output-color color="BLACK" data-bind-color="color" data-on="colorReset:onReset($event)"></output-color>
</template>
<script>
  class TestPage extends CustomElement {
    static component = Object.freeze({
      selector: 'test-page'
    });
    
    onClick(color) {
      this.state.setState({ color });
    }

    onReset(color) {
      this.state.setState({ color });
    }
  };
  TestPage.componentInit();
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

# core.js

The `core.js` creates the `CustomElement` class that provide abstraction for easier working with `Web Components`.

```javascript
window.core = {
  isObject: function (obj) { /** check is object. */ },
  toArray: function (obj) { /** covert list to array */ },
  registerComponent: function (selector, element, dependencies, extend) {
    /** abstraction that first register dependencies, than register the component */
    window.customElements.define(selector, element, { extends: extend });
  },
  /** other methods */
};

class StateManager {
  constructor(onStateChanged) {
  }

  setState(newState) {
  }

  set(key, value) {
  }
}

class CustomElement extends HTMLElement {
  static componentInit() {
    this.prototype.template = document.getElementById(this.component.templateId || this.component.selector);
    core.registerComponent(/** */);
  }

  state = new StateManager(() => {
    /* update all [data-bind], [data-bind-attributeName], [data-css], etc. */
  });

  constructor() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(this.template.content.cloneNode(true));

    // attach to all event listeners specified by [data-on]
    this.shadowRoot.querySelectorAll("[data-on]").forEach((node) => {
      node.addEventListener(/** */);
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.state.set(name, newValue);
    }
  }
}
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
