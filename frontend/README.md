# Frontend

Before you start, please run the following command in the project root to install all dependencies:

```bash
npm install
```

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.3.

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

To run all Cypress component tests and generate a report, first enter the root project directory and then run:

```bash
npm run cy:run:all
```

## Other Useful Commands

Below are some other useful npm scripts defined in package.json:

- **npm run build**

  Build the project for production. Output files will be in the `dist/` directory.
  ```bash
  npm run build
  ```

- **npm run watch**

  Continuously build the project in development mode when files change.
  ```bash
  npm run watch
  ```

- **npm test**

  Run unit tests using Karma.
  ```bash
  npm test
  ```

- **npm run rm-reports**

  Remove all Cypress test reports in `cypress/reports/`.
  ```bash
  npm run rm-reports
  ```

- **npm run cy:run-ct**

  Run Cypress component tests only (without generating a report).
  ```bash
  npm run cy:run-ct
  ```

- **npm run cy:report:merge**

  Merge all Cypress JSON reports into a single `report.json` file.
  ```bash
  npm run cy:report:merge
  ```

- **npm run cy:report:html**

  Generate an HTML report from the merged `report.json`.
  ```bash
  npm run cy:report:html
  ```

- **npm run cy:report:all**

  Merge JSON reports and generate the HTML report in one step.
  ```bash
  npm run cy:report:all
  ```
