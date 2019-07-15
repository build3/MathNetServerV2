const createService = require('feathers-mongoose');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');

module.exports = (app) => {
    const Model = createModel(app);
    const options = { Model, id: 'username' };

    // Initialize our service with any options it requires.
    const users = createService(options);

    users.docs = {
        description: 'Basic service to get the users to be used for accessing this application',
        schemas: {
            users_list: {
                type: 'array',
                items: {
                    properties: {
                        username: {
                            type: 'string',
                            example: 'test',
                        },
                        permissions: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                        },
                        constructions: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                        },
                    },
                },
            },
            users: {
                type: 'object',
                properties: {
                    username: {
                        type: 'string',
                        example: 'test',
                    },
                    password: {
                        type: 'string',
                        writeOnly: true,
                    },
                    permissions: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                    constructions: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                },
            },
        },
    };

    app.use('/users', users);

    // Get our initialized service so that we can register hooks.
    const service = app.service('users');

    service.hooks(hooks);
};
