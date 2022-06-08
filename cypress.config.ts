import { defineConfig } from "cypress";

export default defineConfig({

  e2e: {
    specPattern: "src/__cy-tests__/**/*.cy-test.{js,ts,jsx,tsx}",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
