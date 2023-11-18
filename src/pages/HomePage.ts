import { DfaRenderer } from '@/automatons/dfa/DfaRenderer';
import { homePageSheet, sharedSheet } from '@css/index';

class HomePage extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sharedSheet, homePageSheet];

    const template = document.getElementById(
      'as-home-page',
    ) as HTMLTemplateElement;
    const content = template.content.cloneNode(true);
    shadowRoot.appendChild(content);

    DfaRenderer.render(this.shadowRoot!);
  }
}

customElements.define('as-home-page', HomePage);
