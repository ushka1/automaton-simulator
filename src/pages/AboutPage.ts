import { aboutPageSheet, sharedSheet } from '@css/index';

export class AboutPage extends HTMLElement {
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
