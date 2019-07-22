const { authenticate } = require('@feathersjs/authentication').hooks;
const checkPermissions = require('feathers-permissions');

const { filterOwnedBy, setOwner, checkOwner, isAdmin } = require('../utils.hooks.js');

module.exports = {
    before: {
        all: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'student'] })],
        find: [filterOwnedBy('teacher')],
        get: [filterOwnedBy('teacher')],
        create: [isAdmin, setOwner('teacher')],
        update: [isAdmin, checkOwner('classes', 'code', 'teacher')],
        patch: [isAdmin, checkOwner('classes', 'code', 'teacher')],
        remove: [isAdmin, checkOwner('classes', 'code', 'teacher')],
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
