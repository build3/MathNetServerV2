const createService = require('feathers-memory');
const hooks = require('./views.hooks');

module.exports = (app) => {
    const options = {};

    // Initialize our service with any options it requires.
    app.use('/views', createService(options));

    // Get our initialized service so that we can register hooks.
    const service = app.service('views');

    service.hooks(hooks);
};
