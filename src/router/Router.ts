import { PathPublisher, PathSubscriber } from './PathPublisher';

class Router extends HTMLElement implements PathSubscriber {
  private routingTable: { [path: string]: Node } = {};

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    PathPublisher.getInstance().subscribe(this);
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

    this.render(location.pathname);
  }

  onPathUpdate(path: string): void {
    this.render(path);
  }

  private render(path: string) {
    const page = this.routingTable[path] ?? this.routingTable['*'];

    if (page) {
      this.shadowRoot!.replaceChildren(page);
    } else {
      this.shadowRoot!.replaceChildren();
    }
  }
}

customElements.define('as-router', Router);
