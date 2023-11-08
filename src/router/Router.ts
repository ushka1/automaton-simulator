import { navigationManager } from './NavigationManager';

class Router extends HTMLElement {
  private routingTable: { [path: string]: Node } = {};

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const routes = this.querySelectorAll(
      ':scope > template[is="as-route"]',
    ) as unknown as HTMLTemplateElement[];

    routes.forEach((route) => {
      const path = route.getAttribute('path')!;
      const content = route.content.firstElementChild?.cloneNode(true);
      if (content) {
        this.routingTable[path] = content;
      }
    });

    this.renderRoute(location.pathname);

    navigationManager.subscribe('path', this.onPathChange);
  }

  disconnectedCallback() {
    navigationManager.unsubscribe('path', this.onPathChange);
  }

  private onPathChange = (path: string) => {
    this.renderRoute(path);
  };

  private renderRoute(path: string) {
    const page = this.routingTable[path] ?? this.routingTable['*'];

    if (page) {
      this.shadowRoot!.replaceChildren(page);
    } else {
      this.shadowRoot!.replaceChildren();
    }
  }
}

customElements.define('as-router', Router);
