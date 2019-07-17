const m2s = require('mongoose-to-swagger');
const createService = require('feathers-mongoose');
const createModel = require('../../models/elements.model');
const hooks = require('./elements.hooks');

module.exports = (app) => {
    const Model = createModel(app);
    const options = { Model };

    const elements = createService(options);

    elements.docs = {
        schemas: {
            elements: m2s(Model),
        },
    };

    app.use('/elements', elements);

    const service = app.service('elements');

    service.hooks(hooks);
};
