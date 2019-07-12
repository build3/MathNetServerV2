const createService = require('feathers-mongoose');
const createModel = require('../../models/constructions.model');
const hooks = require('./constructions.hooks');

module.exports = (app) => {
    const Model = createModel(app);
    const options = { Model, id: 'name' };

    // Initialize our service with any options it requires.
    app.use('/constructions', createService(options));

    // Get our initialized service so that we can register hooks.
    const service = app.service('constructions');

    service.hooks(hooks);
};
