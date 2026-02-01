/**
 * Mock for stream module
 */
export class PassThrough {
  private listeners: Map<string, Function[]> = new Map();
  
  on(event: string, handler: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
    return this;
  }

  write(data: string) {
    const dataListeners = this.listeners.get('data') || [];
    dataListeners.forEach(fn => fn(data));
  }

  end() {
    const endListeners = this.listeners.get('end') || [];
    endListeners.forEach(fn => fn());
  }
}
