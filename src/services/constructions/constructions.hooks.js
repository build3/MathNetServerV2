const { authenticate } = require('@feathersjs/authentication').hooks;

const checkOwner = require('./check_owner');
const assignToOwner = require('./assign_to_owner');
const removeFromOwner = require('./remove_from_owner');

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [],
        get: [checkOwner],
        create: [],
        update: [checkOwner],
        patch: [checkOwner],
        remove: [],
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [assignToOwner],
        update: [],
        patch: [],
        remove: [removeFromOwner],
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
