const checkPermissions = require('feathers-permissions');

const { authenticate } = require('@feathersjs/authentication').hooks;

module.exports = {
    before: {
        all: [authenticate('jwt'), checkPermissions({ roles: ['admin'] })],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: [],
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: [],
    },

    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: [],
    },
};
