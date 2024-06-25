import core from './core.js';

function appendElementWithId(tagName, id) {
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement(tagName);
    element.id = id;
    document.body.appendChild(element);
  }

  return element;
}

const scriptTagRegExp = /<script\s*(type="(\w+)")?\s*>(.*?)<\/script>/gs;
const templateId = "test-template-placeholder";
const playgroundId = "test-playground";

export default class TemplateTestSuit {
  #placeholder = null;
  #playground = null;
  #scripts = [];

  get playground() { return this.#playground; }

  constructor(options) {
    this.template = options.template;
    this.tagName = options.tagName || null;
  }

  attach() {
    this.#placeholder = appendElementWithId('div', templateId);
    this.#placeholder.innerHTML = this.#getTemplateWithoutScripts();
    this.#playground = appendElementWithId('div', playgroundId);
    // this.reAppendScriptsDynamicallyToBody();
    this.#reInitializeTheTemplate();
  }

  /**
   * The jsdom and happy-dom environments don't support <script type="module"> and calling this only work at browser. 
   * This will not be used at this point, but it's here for reference.
   */
  reAppendScriptsDynamicallyToBody() {
    this.#scripts.forEach(({ type, script }) => {
      const scriptElement = document.createElement('script');
      type && (scriptElement.type = type);
      scriptElement.innerHTML = script;
      scriptElement.appendChild(document.createTextNode(script));
      document.body.appendChild(scriptElement);
    });
  }

  detach() {
    if (this.#placeholder) {
      document.body.removeChild(this.#placeholder);
    }
  }

  render(html) {
    this.#playground.innerHTML = html || `<${this.tagName}></${this.tagName}>`;
  }

  query(selector) {
    return this.#playground.querySelector(this.tagName).shadowRoot.querySelector(selector);
  }

  #getTemplateWithoutScripts = () => this.template.replace(scriptTagRegExp, (match, attr, type, script) => {
    this.#scripts.push({ type, script });
    return '';
  });

  #reInitializeTheTemplate() {
    const customElement = window.customElements.get(this.tagName);
    if (customElement) {
      core.initTemplateStaticProperty(customElement);
    } else {
      console.error(`Custom element with tag name ${this.tagName} is not defined`);
    }
  }
}
