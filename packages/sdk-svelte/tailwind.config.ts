import type { Config } from 'tailwindcss';
import { theme } from '@viamrobotics/prime-core/theme';

export default {
  content: [
    './src/**/*.{html,svelte,ts}',
    './node_modules/@viamrobotics/prime/dist/prime.js',
    './node_modules/@viamrobotics/prime-core/**/*.{ts,svelte}',
    './node_modules/@viamrobotics/prime-blocks/**/*.{ts,svelte}',
  ],
  theme,
  variants: {
    extend: {},
  },
} satisfies Config;
