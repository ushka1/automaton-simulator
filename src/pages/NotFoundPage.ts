export class NotFoundPage extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  render() {
    this.innerHTML = '<h1>404 Not Found</h1>';
  }
}

customElements.define('as-not-found-page', NotFoundPage);
