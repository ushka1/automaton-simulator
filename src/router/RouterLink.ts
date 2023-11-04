import { navigationManager } from './NavigationManager';

/**
 * A custom HTML anchor element that serves as a router link.
 *
 * This class extends the standard HTMLAnchorElement and adds a click event listener
 * that prevents the default link behavior and cooperates with the NavigationManager
 * to update the application's history state when the link is clicked.
 *
 * @extends HTMLAnchorElement
 */
class RouterLink extends HTMLAnchorElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const path = this.getAttribute('href');
      navigationManager.pushState({}, '', path);
    });
  }
}

customElements.define('as-router-link', RouterLink, { extends: 'a' });
