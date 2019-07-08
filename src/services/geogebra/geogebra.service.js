// Initializes the `geogebra` service on path `/geogebra`
const createService = require('feathers-mongoose');
const createModel = require('../../models/geogebra.model');
const hooks = require('./geogebra.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/geogebra', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('geogebra');

  service.hooks(hooks);
};
