class NotFoundPage extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById(
      'not-found-page',
    ) as HTMLTemplateElement;
    const content = template.content.cloneNode(true);
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(content);
  }
}

customElements.define('as-not-found-page', NotFoundPage);
