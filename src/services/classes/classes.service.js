const createService = require('feathers-mongoose');
const createModel = require('../../models/classes.model');
const hooks = require('./classes.hooks');

module.exports = (app) => {
    const Model = createModel(app);
    const options = { Model };

    // Initialize our service with any options it requires.
    app.use('/classes', createService(options));

    // Get our initialized service so that we can register hooks.
    const service = app.service('classes');

    service.hooks(hooks);
};
