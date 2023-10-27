export class HomePage extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  render() {
    this.innerHTML = '<h1>Home Page</h1>';
  }
}

customElements.define('as-home-page', HomePage);
