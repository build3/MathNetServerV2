const m2s = require('mongoose-to-swagger');
const createService = require('feathers-mongoose');
const createModel = require('../../models/classes.model');
const hooks = require('./classes.hooks');

module.exports = (app) => {
    const Model = createModel(app);
    const options = { Model, id: 'code' };

    const classes = createService(options);

    classes.docs = {
        schemas: {
            classes: m2s(Model),
        },
    };

    app.use('/classes', classes);

    // Get our initialized service so that we can register hooks.
    const service = app.service('classes');

    service.hooks(hooks);
};
