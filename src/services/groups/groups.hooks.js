const app = require('../../app');
const checkPermissions = require('feathers-permissions');

const { authenticate } = require('@feathersjs/authentication').hooks;

const { setOwner, filterOwned, checkOwner } = require('./utils.hooks');

module.exports = {
    before: {
        all: [authenticate('jwt'), checkPermissions({ roles: ['admin'] })],
        find: [filterOwned],
        get: [filterOwned],
        create: [setOwner],
        update: [authenticate('jwt'), checkOwner],
        patch: [authenticate('jwt'), checkOwner],
        remove: [checkOwner],
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
