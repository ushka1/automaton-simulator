import { aboutPageSheet, sharedSheet } from '@css/index';

class AboutPage extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sharedSheet, aboutPageSheet];

    const template = document.getElementById(
      'as-about-page',
    ) as HTMLTemplateElement;
    const content = template.content.cloneNode(true);
    shadowRoot.appendChild(content);
  }
}

customElements.define('as-about-page', AboutPage);
