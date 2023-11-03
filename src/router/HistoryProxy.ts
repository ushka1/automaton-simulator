/* eslint-disable @typescript-eslint/no-explicit-any */

import { PathPublisher } from './PathPublisher';

export class HistoryProxy implements History {
  /* ========================= SINGLETON ========================= */

  private static instance: HistoryProxy;
  private constructor() {
    this.setPopstateListener();
  }

  static getInstance(): HistoryProxy {
    if (!HistoryProxy.instance) {
      HistoryProxy.instance = new HistoryProxy();
    }
    return HistoryProxy.instance;
  }

  /* ========================= BUSINESS ========================= */

  private realHistory = window.history;
  private pathPublisher = PathPublisher.getInstance();

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
    this.pathPublisher.publish(location.pathname);
  }

  replaceState(
    data: any,
    unused: string,
    url?: string | URL | null | undefined,
  ): void {
    this.realHistory.replaceState(data, unused, url);
    this.pathPublisher.publish(location.pathname);
  }

  private setPopstateListener() {
    window.addEventListener('popstate', () => {
      this.pathPublisher.publish(location.pathname);
    });
  }
}
