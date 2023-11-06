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

  connectedCallback() {
    this.onPathChange(location.pathname);
    navigationManager.subscribe('path', this.onPathChange);
  }

  disconnectedCallback() {
    navigationManager.unsubscribe('path', this.onPathChange);
  }

  private onPathChange = (path: string) => {
    if (path === this.getAttribute('href')) {
      this.classList.add('active');
    } else {
      this.classList.remove('active');
    }
  };
}

customElements.define('as-router-link', RouterLink, { extends: 'a' });
