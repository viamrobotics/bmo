import { onMount } from 'svelte';
import { isBrowser } from '@viamrobotics/browser';
import { noopCanceller, type Canceller } from '$lib/canceller';
import { scheduleAsyncInterval, scheduleInterval } from '$lib/interval';
import { get, writable, type Readable, readable } from 'svelte/store';

export interface UseInterval {
  schedule: (callback: () => void, interval: number) => void;
  cancel: Canceller;
}

export interface UseAsyncInterval {
  schedule: (callback: () => Promise<void>, interval: number) => void;
  cancel: Canceller;
}

const NOOP: UseInterval & UseAsyncInterval = {
  schedule: () => ({}),
  cancel: noopCanceller,
};

export const useInterval = (): Readable<UseInterval> => {
  if (!isBrowser) {
    return readable(NOOP);
  }

  const store = writable<UseInterval>({
    cancel: noopCanceller,
    schedule: (callback: () => void, interval: number) => {
      get(store).cancel();
      store.update(({ schedule }) => ({
        schedule,
        cancel: scheduleInterval(callback, interval),
      }));
    },
  });

  onMount(() => {
    return get(store).cancel;
  });

  return store;
};

export const useAsyncInterval = (): Readable<UseAsyncInterval> => {
  if (!isBrowser) {
    return readable(NOOP);
  }

  const store = writable<UseAsyncInterval>({
    cancel: noopCanceller,
    schedule: (callback: () => Promise<void>, interval: number) => {
      get(store).cancel();
      store.update(({ schedule }) => ({
        schedule,
        cancel: scheduleAsyncInterval(callback, interval),
      }));
    },
  });

  onMount(() => {
    return get(store).cancel;
  });

  return store;
};
