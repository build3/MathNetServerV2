const { authenticate } = require('@feathersjs/authentication').hooks;
const { setOwner, checkOwner } = require('../utils.hooks.js');

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [],
        get: [],
        create: [setOwner('owner')],
        update: [checkOwner('elements', 'id', 'owner')],
        patch: [checkOwner('elements', 'id', 'owner')],
        remove: [checkOwner('elements', 'id', 'owner')],
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
