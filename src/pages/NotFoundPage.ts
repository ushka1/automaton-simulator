import { notFoundPageSheet, sharedSheet } from '@css/index';

class NotFoundPage extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sharedSheet, notFoundPageSheet];

    const template = document.getElementById(
      'as-not-found-page',
    ) as HTMLTemplateElement;
    const content = template.content.cloneNode(true);
    shadowRoot.appendChild(content);
  }
}

customElements.define('as-not-found-page', NotFoundPage);
