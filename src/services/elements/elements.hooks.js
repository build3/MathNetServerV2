const { authenticate } = require('@feathersjs/authentication').hooks;
const { setOwner, checkOwner } = require('../utils.hooks.js');

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [],
        get: [],
        create: [setOwner('user')],
        update: [checkOwner('elements', '_id', 'owner')],
        patch: [checkOwner('elements', '_id', 'owner')],
        remove: [checkOwner('elements', '_id', 'owner')],
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
