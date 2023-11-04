/* eslint-disable @typescript-eslint/no-explicit-any */

import { EventPublisher } from './EventPublisher';

class NavigationManager implements History {
  /* ========================= SINGLETON ========================= */

  private static instance: NavigationManager;
  private constructor() {
    this.setPopstateListener();
  }

  static getInstance(): NavigationManager {
    if (!NavigationManager.instance) {
      NavigationManager.instance = new NavigationManager();
    }
    return NavigationManager.instance;
  }

  /* ========================= OBSERVER ========================= */

  private eventPublisher = new EventPublisher<{
    path: [path: string];
  }>();

  get subscribe() {
    return this.eventPublisher.subscribe;
  }

  get unsubscribe() {
    return this.eventPublisher.unsubscribe;
  }

  /* ========================= PROXY ========================= */

  private realHistory = window.history;

  get state(): any {
    return this.realHistory.state;
  }

  get length(): number {
    return this.realHistory.length;
  }

  get scrollRestoration(): ScrollRestoration {
    return this.realHistory.scrollRestoration;
  }

  set scrollRestoration(value: ScrollRestoration) {
    this.realHistory.scrollRestoration = value;
  }

  back(): void {
    this.realHistory.back();
  }

  forward(): void {
    this.realHistory.forward();
  }

  go(delta?: number | undefined): void {
    this.realHistory.go(delta);
  }

  pushState(
    data: any,
    unused: string,
    url?: string | URL | null | undefined,
  ): void {
    this.realHistory.pushState(data, unused, url);
    this.eventPublisher.publish('path', location.pathname);
  }

  replaceState(
    data: any,
    unused: string,
    url?: string | URL | null | undefined,
  ): void {
    this.realHistory.replaceState(data, unused, url);
    this.eventPublisher.publish('path', location.pathname);
  }

  private setPopstateListener() {
    window.addEventListener('popstate', () => {
      this.eventPublisher.publish('path', location.pathname);
    });
  }
}

export const navigationManager = NavigationManager.getInstance();
