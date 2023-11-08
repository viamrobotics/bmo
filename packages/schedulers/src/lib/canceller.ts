export type Canceller = () => void;

export const noopCanceller: Canceller = () => ({});
