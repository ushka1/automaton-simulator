/* eslint-disable @typescript-eslint/no-explicit-any */

export type ListenerFunction<T extends any[]> = (...args: T) => void;

/**
 * A utility class for managing and publishing events with associated listeners.
 *
 * This class provides a mechanism to subscribe to events, unsubscribe from events,
 * and publish events to notify registered listeners. Events can be of any type and
 * associated with specific listener functions. It allows decoupled communication
 * between different parts of an application.
 *
 * @template T - A type representing the events and their associated argument types.
 */
export class EventPublisher<T extends Record<string, any[]>> {
  private subscribers: Map<keyof T, Set<ListenerFunction<any>>> = new Map();

  subscribe = <K extends keyof T>(
    event: K,
    listener: ListenerFunction<T[K]>,
  ) => {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)!.add(listener);
  };

  unsubscribe = <K extends keyof T>(
    event: K,
    listener: ListenerFunction<T[K]>,
  ) => {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event)!.delete(listener);
    }
  };

  publish = <K extends keyof T>(event: K, ...args: T[K]) => {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event)!.forEach((listener) => listener(...args));
    }
  };
}
