import { defineConfig } from "cypress";
import codeCoverageTask from '@cypress/code-coverage/task';

export default defineConfig({
  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack"
    },
    specPattern: "**/*.cy.ts",
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);
      return config;
    }
  },
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: false,
    json: true
  }
});
