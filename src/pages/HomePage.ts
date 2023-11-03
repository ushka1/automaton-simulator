class HomePage extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });
    const template = document.getElementById(
      'as-home-page',
    ) as HTMLTemplateElement;
    const content = template.content.cloneNode(true);
    shadowRoot.appendChild(content);
  }
}

customElements.define('as-home-page', HomePage);
