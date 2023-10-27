import { Router } from './Router';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';

/**
 * App entry point.
 */
export class App extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  render() {
    const router = new Router({
      '/': new HomePage(),
      '/about': new AboutPage(),
    });

    this.replaceChildren(router);
  }
}

customElements.define('as-app', App);
