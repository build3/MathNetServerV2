const createService = require('feathers-memory');
const hooks = require('./elements.hooks');

module.exports = (app) => {
    const elements = createService();

    elements.docs = {
        schemas: {
            elements_list: {
                type: 'array',
                items: {
                    properties: {
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
                    },
                },
            },
            elements: {
                type: 'object',
                properties: {
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
                },
            },
        },
    };

    app.use('/elements', elements);

    const service = app.service('elements');

    service.hooks(hooks);
};
