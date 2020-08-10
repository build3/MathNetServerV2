const { authenticate } = require('@feathersjs/authentication').hooks;
const checkPermissions = require('feathers-permissions');

const { filterOwnedBy, setOwner, checkOwner, isAdmin } = require('../utils.hooks.js');

const { setCode } = require('./hooks');

const { setGroupColor } = require('./set_group_color')
const { reGenerateColor } = require('./regenerate_color.js');

module.exports = {
    before: {
        all: [authenticate('jwt'), checkPermissions({ roles: ['admin', 'student'] })],
        find: [filterOwnedBy('teacher'), setGroupColor],
        get: [filterOwnedBy('teacher')],
        create: [isAdmin, setOwner('teacher'), setCode],
        update: [isAdmin, checkOwner('classes', 'code', 'teacher')],
        patch: [isAdmin, checkOwner('classes', 'code', 'teacher')],
        remove: [isAdmin, checkOwner('classes', 'code', 'teacher')],
    },

    after: {
        all: [],
        find: [reGenerateColor],
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
