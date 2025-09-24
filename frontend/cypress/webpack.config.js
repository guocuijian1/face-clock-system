const { createAngularWebpackConfig } = require('@cypress/angular-dev-server');
const { addIstanbulInstrumentation } = require('@cypress/code-coverage/use-babelrc');

module.exports = (config) => {
  config = createAngularWebpackConfig(config);
  addIstanbulInstrumentation(config);
  return config;
};

