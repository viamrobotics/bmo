import { onMount } from 'svelte';
import { isBrowser } from '@viamrobotics/browser';
import { noopCanceller, type Canceller } from '$lib/canceller';
import { scheduleAsyncTimeout, scheduleTimeout } from '$lib/timeout';
import { readable, writable, type Readable, get } from 'svelte/store';

export interface UseTimeout {
  schedule: (callback: () => void, delay: number) => void;
  cancel: Readable<Canceller>;
}

export interface UseAsyncTimeout {
  schedule: (callback: () => Promise<void>, delay: number) => void;
  cancel: Readable<Canceller>;
}

const NOOP: UseTimeout & UseAsyncTimeout = {
  schedule: () => ({}),
  cancel: readable(noopCanceller),
};

export const useTimeout = (): UseTimeout => {
  if (!isBrowser) {
    return NOOP;
  }

  const cancel = writable<Canceller>(noopCanceller);

  const schedule = (callback: () => void, timeout: number) => {
    get(cancel)();
    cancel.set(scheduleTimeout(callback, timeout));
  };

  onMount(() => {
    return get(cancel);
  });

  return { schedule, cancel };
};

export const useAsyncTimeout = (): UseAsyncTimeout => {
  if (!isBrowser) {
    return NOOP;
  }

  const cancel = writable<Canceller>(noopCanceller);

  const schedule = (callback: () => Promise<void>, timeout: number) => {
    get(cancel)();
    cancel.set(scheduleAsyncTimeout(callback, timeout));
  };

  onMount(() => {
    return get(cancel);
  });

  return { schedule, cancel };
};
