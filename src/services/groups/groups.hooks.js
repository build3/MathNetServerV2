const { authenticate } = require('@feathersjs/authentication').hooks;
const checkPermissions = require('feathers-permissions');

const { filterOwnedBy, setOwner, checkOwner, isAdmin } = require('../utils.hooks.js');
const { setGroupName } = require('./set_group_name');

const { generateColor } = require('../users/utils.hooks.js');

module.exports = {
    before: {
        all: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'student'] })],
        find: [filterOwnedBy('teacher')],
        get: [filterOwnedBy('teacher')],
        create: [isAdmin, setOwner('teacher'), generateColor],
        update: [isAdmin, checkOwner('groups', '_id', 'teacher')],
        patch: [isAdmin, checkOwner('groups', '_id', 'teacher')],
        remove: [isAdmin, checkOwner('groups', '_id', 'teacher')],
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [setGroupName],
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
