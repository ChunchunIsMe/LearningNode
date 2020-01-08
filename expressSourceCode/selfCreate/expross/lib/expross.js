const Application = require('./Application');
const Router = require('./router');
function createApplication() {
  const app = new Application();
  return app;
}
createApplication.Router = Router;
module.exports = createApplication;