class HomePage extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById(
      'home-page',
    ) as HTMLTemplateElement;
    const content = template.content.cloneNode(true);
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(content);
  }
}

customElements.define('as-home-page', HomePage);
