import { HistoryProxy } from './HistoryProxy';

class RouterLink extends HTMLAnchorElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const path = this.getAttribute('href');
      HistoryProxy.getInstance().pushState({}, '', path);
    });
  }
}

customElements.define('as-router-link', RouterLink, { extends: 'a' });
