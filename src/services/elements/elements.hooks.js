const { authenticate } = require('@feathersjs/authentication').hooks;
const { setOwner, checkOwner } = require('../utils.hooks.js');

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [],
        get: [],
        create: [setOwner('user')],
        update: [checkOwner('elements', '_id')],
        patch: [checkOwner('elements', '_id')],
        remove: [checkOwner('elements', '_id')],
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
