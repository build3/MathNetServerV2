const { authenticate } = require('@feathersjs/authentication').hooks;
const checkPermissions = require('feathers-permissions');

const { filterOwnedBy, setOwner, checkOwner } = require('../utils.hooks.js');


module.exports = {
    before: {
        all: [authenticate('jwt'), checkPermissions({ roles: ['admin'] })],
        find: [filterOwnedBy('teacher')],
        get: [filterOwnedBy('teacher')],
        create: [setOwner('teacher')],
        update: [checkOwner('groups', '_id')],
        patch: [checkOwner('groups', '_id')],
        remove: [checkOwner('groups', '_id')],
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
