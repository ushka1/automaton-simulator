import './RouterLink';

type Routes = { [path: string]: HTMLElement };

export class Router {
  constructor(
    private routes: Routes,
    private defaultPage: HTMLElement,
    private mountPoint: HTMLElement,
  ) {
    this.setPushStateProxy();
    this.setReplaceStateProxy();
    this.setPopStateListener();

    this.render(location.pathname);
  }

  // history.pushState()
  private setPushStateProxy() {
    history.pushState = new Proxy(history.pushState, {
      apply: (target, thisArg, args) => {
        target.apply(thisArg, args as Parameters<typeof history.pushState>);
        this.render(args[2]);
      },
    });
  }

  // history.replaceState()
  private setReplaceStateProxy() {
    history.replaceState = new Proxy(history.replaceState, {
      apply: (target, thisArg, args) => {
        target.apply(thisArg, args as Parameters<typeof history.replaceState>);
        this.render(args[2]);
      },
    });
  }

  // history.back()
  // history.forward()
  private setPopStateListener() {
    window.addEventListener('popstate', () => {
      this.render(location.pathname);
    });
  }

  private render(path: string) {
    const page = this.routes[path] ?? this.defaultPage;
    this.mountPoint.replaceChildren(page);
  }
}
