const { authenticate } = require('@feathersjs/authentication').hooks;
const checkPermissions = require('feathers-permissions');

const { checkGroupOwner } = require('./utils.hooks');
const { filterOwnedByTeacher, setTeacherOwner } = require('../utils.hooks.js');


module.exports = {
    before: {
        all: [authenticate('jwt'), checkPermissions({ roles: ['admin'] })],
        find: [filterOwnedByTeacher],
        get: [filterOwnedByTeacher],
        create: [setTeacherOwner],
        update: [checkGroupOwner],
        patch: [checkGroupOwner],
        remove: [checkGroupOwner],
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
