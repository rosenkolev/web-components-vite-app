
window.core = (function () {
  const elementsToBeDefined = new Map();
  const definedElementNames = new Set();
  const isDebug = window.DEBUG_CUSTOM_ELEMENTS || false;

  document.addEventListener("DOMContentLoaded", () => {
    elementsToBeDefined.forEach(({ element, dependencies }, selector) => core.defineComponent(selector, element, dependencies));
  }, false);

  // This function is used to proxy events for debugging purposes.
  function proxyEvent(source) {
    var emit = source.dispatchEvent;  // obtain reference
    source.dispatchEvent = function (event) {
      console.debug("event:", event.type, 'detail:', event.detail, 'target:', event.target);
      return emit.apply(this, arguments);  // call original method
    };
  }

  return Object.freeze({
    /** Check if the argument is an object. */
    isObject: function (obj) {
      return Object.prototype.toString.call(obj) === "[object Object]";
    },
    /** Convert an object to an array. */
    toArray: function (obj) {
      return Array.prototype.slice.call(obj);
    },
    /** Expand the property key of an object. */
    expandPropertyKey: function (obj) {
      return Object.keys(obj).map((k) =>
        core.isObject(obj[k])
          ? `${key}.${core.expandPropertyKey(k, obj[k])}`
          : `${key}.${k}`
      );
    },
    /** Register a component by defining it immediately or postponing the definition, based on dependencies. */
    registerComponent: function (selector, element, dependencies, extend) {
      if (!dependencies || !dependencies.length || dependencies.every((dep) => definedElementNames.has(dep))) {
        // The component have no dependencies or all dependencies are already defined. So we can define the component right now.
        core.defineComponent(selector, element, dependencies, extend);
      } else {
        // Postpone the component definition until all dependencies are defined.
        elementsToBeDefined.set(selector, { element, dependencies, extend });
      }
    },
    /** Define a component/custom element and all it's dependencies. */
    defineComponent: function (selector, element, dependencies, extend) {
      if (definedElementNames.has(selector)) {
        throw new Error(`Component ${selector} already defined`);
      }

      if (dependencies) {
        dependencies.forEach((dep) => {
          // Define the dependency if it is not already defined.
          if (!definedElementNames.has(dep)) {
            const { element, dependencies, extend } = elementsToBeDefined.get(dep);
            core.defineComponent(dep, element, dependencies, extend);
          }
        });
      }

      window.customElements.define(selector, element, { extends: extend });
      definedElementNames.add(selector);
      if (isDebug) {
        proxyEvent(element.prototype);
        console.debug(`define ${selector}`)
      }
    },
    isDebug: function () { return isDebug; }
  });
})();

class StateManager {
  #state = {};
  #updater;
  constructor(fn) {
    this.#updater = fn;
  }

  setState(newState) {
    Object.entries(newState).forEach(([key, value]) => (this.set(key, value)));
  }

  set(key, value) {
    this.#state[key] =
      core.isObject(this.#state[key]) && core.isObject(value)
        ? Object.assign({}, this.#state[key], value)
        : value;

    const bindKey = core.isObject(value) ? core.expandPropertyKey(key, value) : key;
    const bindKeys = Array.isArray(bindKey) ? bindKey : [bindKey];
    bindKeys.forEach((key) => {
      const bindValue = key.includes('.')
        ? key.split('.').slice(1).reduce((obj, p) => obj[p], value)
        : value;

      this.#updater(key, bindValue);
    });
  }
}

class CustomElement extends HTMLElement {
  static componentInit() {
    if (!this.component) throw new Error("Component must have a component static property!");
    if (!this.component.selector) throw new Error("The component object must have a selector property!");

    const { selector, templateId, dependencies } = this.component;
    const template = document.getElementById(templateId || selector);
    // Create a getter for the template HTML element.
    Object.defineProperty(this.prototype, "template", { get: function () { return template; } });
    core.registerComponent(selector, this, dependencies);
  }

  #state = new StateManager(this.#updateBinding.bind(this));
  get state() { return this.#state; }
  get root() { return this.shadowRoot || this; }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // append template content to shadow root
    const element = this.template.content.cloneNode(true);
    this.shadowRoot.appendChild(element);
    // attach event listeners. Example: data-on="click:handleClick()"
    this.shadowRoot.querySelectorAll("[data-on]").forEach((node) => {
      const [event, action] = node.dataset.on.split(':');
      const runner = new Function(`with (this) { const $event=arguments[0]; ${action} }`).bind(this);
      node.addEventListener(event, function (ev) { runner(ev.detail); });
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      core.isDebug() && console.debug(`input: ${name} ${oldValue} -> ${newValue}`);
      this.state.set(name, newValue);
      this.onAttributeChanged && this.onAttributeChanged(name, oldValue, newValue);
    }
  }

  selectAll(selector) {
    return core.toArray(this.root.querySelectorAll(selector));
  }

  #updateBinding(prop, value = "") {
    // Update InnerText. Example: <div data-bind="text">
    this.selectAll(`[data-bind="${prop}"]`).forEach(
      (node) => (node.textContent = value.toString())
    );
    // Update attributes. Example: <input data-bind-value="email">
    this.selectAll(`[data-bind-${prop}]`).forEach((node) =>
      node.setAttribute(prop, value)
    );
    // Update styles. Example: <div data-css="color:primary">
    this.selectAll(`[data-css$=${prop}]`).forEach((node) => {
      const key = prop.split(":").shift();
      node.style[key] = value;
    });
  }
}
