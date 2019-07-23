const createService = require('feathers-memory');
const hooks = require('./workshops.hooks');

module.exports = function (app) {
    const paginate = app.get('paginate');
    const options = { events: ['xml-changed'] };

    // Initialize our service with any options it requires
    app.use('/workshops', createService(options));

    // Get our initialized service so that we can register hooks
    const service = app.service('workshops');

    service.hooks(hooks);
};
