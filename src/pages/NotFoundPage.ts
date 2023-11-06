import styles from './NotFoundPage.css?inline';

class NotFoundPage extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    shadowRoot.adoptedStyleSheets = [sheet];

    const template = document.getElementById(
      'as-not-found-page',
    ) as HTMLTemplateElement;
    const content = template.content.cloneNode(true);
    shadowRoot.appendChild(content);
  }
}

customElements.define('as-not-found-page', NotFoundPage);
