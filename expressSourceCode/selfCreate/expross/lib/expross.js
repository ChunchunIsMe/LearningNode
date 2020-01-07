const Application = require('./Application');
function createApplication() {
  const app = new Application();
  return app;
}

module.exports = createApplication;