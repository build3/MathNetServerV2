const createService = require('feathers-memory');
const hooks = require('./elements.hooks');

module.exports = (app) => {
    const options = { events: ['xml-changed'] };

    const elements = createService(options);

    const properties = {
        name: {
            type: 'string',
        },
        owner: {
            type: 'string',
        },
        workshop: {
            type: 'string',
        },
        xml: {
            type: 'string',
        },
    };

    elements.docs = {
        schemas: {
            elements_list: {
                type: 'array',
                items: {
                    properties,
                },
            },
            elements: {
                type: 'object',
                properties,
            },
        },
    };

    app.use('/elements', elements);

    const service = app.service('elements');

    service.hooks(hooks);
};
