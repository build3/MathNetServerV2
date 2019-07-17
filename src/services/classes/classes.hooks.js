const { authenticate } = require('@feathersjs/authentication').hooks;
const checkPermissions = require('feathers-permissions');

const { filterOwnedBy, setOwner, checkOwner } = require('../utils.hooks.js');

module.exports = {
    before: {
        all: [authenticate('jwt'), checkPermissions({ roles: ['admin'] })],
        find: [filterOwnedBy('teacher')],
        get: [filterOwnedBy('teacher')],
        create: [setOwner('teacher')],
        update: [checkOwner('classes', 'code', 'teacher')],
        patch: [checkOwner('classes', 'code', 'teacher')],
        remove: [checkOwner('classes', 'code', 'teacher')],
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
