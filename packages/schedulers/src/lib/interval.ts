import { noopCanceller, type Canceller } from './canceller';
import { scheduleAsyncTimeout, scheduleTimeout } from './timeout';

export const scheduleInterval = (
  callback: () => void,
  interval: number
): Canceller => {
  let canceller = noopCanceller;
  let cancelled = false;

  const timeout = () => {
    canceller = scheduleTimeout(refreshAndScheduleNext, interval);
  };

  const refreshAndScheduleNext = () => {
    callback();

    if (cancelled) {
      return;
    }

    timeout();
  };

  const cancel = () => {
    cancelled = true;
    canceller();
  };

  timeout();
  return cancel;
};

export const scheduleAsyncInterval = (
  callback: () => Promise<void>,
  interval: number
): Canceller => {
  let canceller = noopCanceller;
  let cancelled = false;

  const timeout = () => {
    canceller = scheduleAsyncTimeout(refreshAndScheduleNext, interval);
  };

  const refreshAndScheduleNext = async () => {
    await callback();

    if (cancelled) {
      return;
    }

    timeout();
  };

  const cancel = () => {
    cancelled = true;
    canceller();
  };

  timeout();
  return cancel;
};
