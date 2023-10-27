import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
  },
  testDir: 'tests',
  // eslint-disable-next-line prefer-named-capture-group
  testMatch: /(.+\.)?(test|spec)\.[jt]s/u,
};

export default config;
