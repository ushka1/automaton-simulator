class AboutPage extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById(
      'as-about-page',
    ) as HTMLTemplateElement;
    const content = template.content.cloneNode(true);
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(content);
  }
}

customElements.define('as-about-page', AboutPage);
