import { NotFoundPage } from './pages/NotFoundPage';

type Routes = { [path: string]: HTMLElement };

/**
 * Router utilizing the History API.
 */
export class Router extends HTMLElement {
  private path: string;
  private routes: Routes;

  constructor(routes: Routes) {
    super();
    this.path = location.pathname;
    this.routes = routes;

    this.setPushStateProxy();
    this.setReplaceStateProxy();
    this.setPopStateListener();
    this.render();
  }

  private setPath(path: string) {
    this.path = path;
    this.render();
  }

  // history.pushState()
  private setPushStateProxy() {
    history.pushState = new Proxy(history.pushState, {
      apply: (target, thisArg, args) => {
        target.apply(thisArg, args as Parameters<typeof history.pushState>);
        this.setPath(args[2]);
      },
    });
  }

  // history.replaceState()
  private setReplaceStateProxy() {
    history.replaceState = new Proxy(history.replaceState, {
      apply: (target, thisArg, args) => {
        target.apply(thisArg, args as Parameters<typeof history.replaceState>);
        this.setPath(args[2]);
      },
    });
  }

  // history.back()
  // history.forward()
  private setPopStateListener() {
    window.addEventListener('popstate', () => {
      this.setPath(location.pathname);
    });
  }

  private render() {
    this.replaceChildren(this.routes[this.path] ?? new NotFoundPage());
  }
}

customElements.define('as-router', Router);
