export interface PathSubscriber {
  onPathUpdate(pathname: string): void;
}

export class PathPublisher {
  /* ========================= SINGLETON ========================= */

  private static instance: PathPublisher;
  private constructor() {}

  static getInstance(): PathPublisher {
    if (!PathPublisher.instance) {
      PathPublisher.instance = new PathPublisher();
    }
    return PathPublisher.instance;
  }

  /* ========================= OBSERVER ========================= */

  private subscribers: Set<PathSubscriber> = new Set();

  subscribe(subscriber: PathSubscriber): void {
    this.subscribers.add(subscriber);
  }

  unsubscribe(subscriber: PathSubscriber): void {
    this.subscribers.delete(subscriber);
  }

  publish(path: string): void {
    this.subscribers.forEach((s) => s.onPathUpdate(path));
  }
}
