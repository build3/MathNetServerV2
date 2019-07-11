const createService = require('feathers-mongoose');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');

module.exports = (app) => {
    const Model = createModel(app);
    const options = { Model, id: 'username' };

    // Initialize our service with any options it requires.
    app.use('/users', createService(options));

    // Get our initialized service so that we can register hooks.
    const service = app.service('users');

    service.hooks(hooks);
};
