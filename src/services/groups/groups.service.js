const m2s = require('mongoose-to-swagger');
const createService = require('feathers-mongoose');
const createModel = require('../../models/groups.model');
const hooks = require('./groups.hooks');

module.exports = (app) => {
    const Model = createModel(app);
    const options = { Model };

    const groups = createService(options);

    groups.docs = {
        schemas: {
            groups: m2s(Model),
        },
    };

    app.use('/groups', groups);

    // Get our initialized service so that we can register hooks.
    const service = app.service('groups');

    service.hooks(hooks);
};
