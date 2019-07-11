const { authenticate } = require('@feathersjs/authentication').hooks;

const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;

const checkPermissions = require('feathers-permissions');

const { adminOrOwner, owner, preventChangesIfNotOwner } = require('../utils.hooks');

module.exports = {
    before: {
        all: [],
        find: [authenticate('jwt'), checkPermissions({ roles: ['admin'] })],
        get: [authenticate('jwt'), adminOrOwner()],
        create: [hashPassword()],
        update: [hashPassword(), authenticate('jwt'), owner()],
        patch: [
            hashPassword(), authenticate('jwt'),
            adminOrOwner(), preventChangesIfNotOwner('password'),
        ],
        remove: [authenticate('jwt'), checkPermissions({ roles: [] })],
    },

    after: {
        all: [
            // Make sure the password field is never sent to the client
            // Always must be the last hook.
            protect('password'),
        ],
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
