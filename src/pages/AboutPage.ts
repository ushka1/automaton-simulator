import styles from './AboutPage.css?inline';

console.log(styles);

class AboutPage extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    shadowRoot.adoptedStyleSheets = [sheet];

    const template = document.getElementById(
      'as-about-page',
    ) as HTMLTemplateElement;
    const content = template.content.cloneNode(true);
    shadowRoot.appendChild(content);
  }
}

customElements.define('as-about-page', AboutPage);
