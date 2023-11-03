class RouterLink extends HTMLAnchorElement {
  constructor() {
    super();

    this.addEventListener('click', (event) => {
      event.preventDefault();
      const path = this.getAttribute('href');
      window.history.pushState({}, '', path);
    });
  }
}

customElements.define('as-router-link', RouterLink, { extends: 'a' });
