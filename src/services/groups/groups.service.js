const createService = require('feathers-mongoose');
const createModel = require('../../models/groups.model');
const hooks = require('./groups.hooks');

module.exports = (app) => {
    const Model = createModel(app);
    const options = { Model };

    // Initialize our service with any options it requires.
    app.use('/groups', createService(options));

    // Get our initialized service so that we can register hooks.
    const service = app.service('groups');

    service.hooks(hooks);
};
