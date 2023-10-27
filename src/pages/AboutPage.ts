export class AboutPage extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  render() {
    this.innerHTML = '<h1>About Page</h1>';
  }
}

customElements.define('as-about-page', AboutPage);
