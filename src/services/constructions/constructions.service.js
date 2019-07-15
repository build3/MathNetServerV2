const m2s = require('mongoose-to-swagger');
const createService = require('feathers-mongoose');
const createModel = require('../../models/constructions.model');
const hooks = require('./constructions.hooks');

module.exports = (app) => {
    const Model = createModel(app);
    const options = { Model, id: 'name' };

    const constructions = createService(options);

    constructions.docs = {
        schemas: {
            constructions: m2s(Model),
        },
    };

    app.use('/constructions', constructions);

    // Get our initialized service so that we can register hooks.
    const service = app.service('constructions');

    service.hooks(hooks);
};
