class Route extends HTMLTemplateElement {
  constructor() {
    super();
  }
}

customElements.define('as-route', Route, { extends: 'template' });
