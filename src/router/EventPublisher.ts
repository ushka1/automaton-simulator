/* eslint-disable @typescript-eslint/no-explicit-any */

export type HandlerFunction<T extends any[]> = (...args: T) => void;

/**
 * A utility class for managing and publishing events with associated handlers.
 *
 * This class provides a mechanism to subscribe to events, unsubscribe from events,
 * and publish events to notify registered handlers. Events can be of any type and
 * associated with specific handler functions. It allows decoupled communication
 * between different parts of an application.
 *
 * @template T - A type representing the events and their associated argument types.
 */
export class EventPublisher<T extends Record<string, any[]>> {
  private subscribers: Map<keyof T, Set<HandlerFunction<any>>> = new Map();

  subscribe = <K extends keyof T>(event: K, handler: HandlerFunction<T[K]>) => {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)!.add(handler);
  };

  unsubscribe = <K extends keyof T>(
    event: K,
    handler: HandlerFunction<T[K]>,
  ) => {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event)!.delete(handler);
    }
  };

  publish = <K extends keyof T>(event: K, ...args: T[K]) => {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event)!.forEach((handler) => handler(...args));
    }
  };
}
