type EventKey = string;
// eslint-disable-next-line
type EventHandler<T = any> = (payload: T) => void;
type Bus<E> = Record<keyof E, E[keyof E][]>;
export type EventMap = Record<EventKey, EventHandler>;

export interface EventBus<T extends EventMap> {
  on: <Key extends keyof T>(key: Key, handler: T[Key]) => () => void;
  off: <Key extends keyof T>(key: Key, handler: T[Key]) => void;
  once: <Key extends keyof T>(key: Key, handler: T[Key]) => void;
  emit: <Key extends keyof T>(key: Key, payload: Parameters<T[Key]>[0]) => void;
}

export default function createEventBus<E extends EventMap>(): EventBus<E> {
  const bus: Partial<Bus<E>> = {};

  const off: EventBus<E>["off"] = (key, handler) => {
    const index = bus[key]?.indexOf(handler) ?? -1;
    bus[key]?.splice(index, 1);
  };

  const on: EventBus<E>["on"] = (key, handler) => {
    if (typeof bus[key] === "undefined") {
      bus[key] = [];
    }
    bus[key].push(handler);

    return () => {
      off(key, handler);
    };
  };

  const once: EventBus<E>["once"] = (key, handler) => {
    const handleOnce = (payload: Parameters<typeof handler>) => {
      handler(payload);
      off(key, handleOnce as typeof handler);
    };

    on(key, handleOnce as typeof handler);
  };

  const emit: EventBus<E>["emit"] = (key, payload) => {
    bus[key]?.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        console.error("alertEventChannel", e);
      }
    });
  };

  return {
    on,
    off,
    once,
    emit,
  };
}
