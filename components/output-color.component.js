import { CustomElement } from 'core';

class OutputColor extends CustomElement {
  static component = Object.freeze({
    selector: 'output-color'
  });

  static get observedAttributes() { return ['color']; }

  onReset() {
    this.dispatchEvent(
      new CustomEvent('colorReset', { detail: 'BLACK', composed: true })
    );
  }
}

OutputColor.componentInit();
