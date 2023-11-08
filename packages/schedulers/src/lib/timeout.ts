import type { Canceller } from './canceller';

export const scheduleTimeout = (
  callback: () => void,
  delay: number
): Canceller => {
  let timeoutId = -1;

  let cancel = () => {
    window.clearTimeout(timeoutId);
  };

  const timeout = () => {
    const next = window.setTimeout(callback, delay);
    cancel = () => window.clearTimeout(next);
    timeoutId = next;
  };

  timeout();
  return cancel;
};

export const scheduleAsyncTimeout = (
  callback: () => Promise<void>,
  delay: number
): Canceller => {
  let timeoutId = -1;

  const cancel = () => window.clearTimeout(timeoutId);
  const timeout = () => {
    timeoutId = window.setTimeout(() => {
      void callback();
    }, delay);
  };

  timeout();
  return cancel;
};
