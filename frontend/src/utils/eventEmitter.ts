export class EventEmitter<EventMap extends Record<string, any>> {
  private events: {
    [K in keyof EventMap]?: Array<(data: EventMap[K]) => void>;
  } = {};

  /**
   * Subscribe to an event
   * @param event The event name to subscribe to
   * @param listener The callback function
   * @returns The event emitter instance for chaining
   */
  on<K extends keyof EventMap>(
    event: K,
    listener: (data: EventMap[K]) => void,
  ): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]?.push(listener);
    return this; // For chaining
  }

  /**
   * Remove a specific listener for an event
   * @param event The event name
   * @param listenerToRemove The callback function to remove
   * @returns The event emitter instance for chaining
   */
  off<K extends keyof EventMap>(
    event: K,
    listenerToRemove: (data: EventMap[K]) => void,
  ): this {
    if (!this.events[event]) return this;

    this.events[event] = this.events[event]?.filter(
      (listener) => listener !== listenerToRemove,
    ) as Array<(data: EventMap[K]) => void>;

    return this; // For chaining
  }

  /**
   * Emit an event with data
   * @param event The event name to emit
   * @param data The data to pass to listeners
   * @returns Boolean indicating if the event had listeners
   */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): boolean {
    if (!this.events[event] || this.events[event]?.length === 0) return false;

    this.events[event]?.forEach((listener) => {
      listener(data);
    });

    return true;
  }

  /**
   * Subscribe to an event only once
   * @param event The event name to subscribe to
   * @param listener The callback function
   * @returns The event emitter instance for chaining
   */
  once<K extends keyof EventMap>(
    event: K,
    listener: (data: EventMap[K]) => void,
  ): this {
    const onceWrapper = (data: EventMap[K]) => {
      listener(data);
      this.off(event, onceWrapper);
    };

    return this.on(event, onceWrapper);
  }
}
