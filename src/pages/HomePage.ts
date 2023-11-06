import styles from './HomePage.css?inline';

class HomePage extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    shadowRoot.adoptedStyleSheets = [sheet];

    const template = document.getElementById(
      'as-home-page',
    ) as HTMLTemplateElement;
    const content = template.content.cloneNode(true);
    shadowRoot.appendChild(content);
  }
}

customElements.define('as-home-page', HomePage);
