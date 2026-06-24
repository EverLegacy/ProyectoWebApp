import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents() {},
    video: true,                 
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,                
      openMode: 0,
    },
  },
});
