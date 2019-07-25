const { authenticate } = require('@feathersjs/authentication').hooks;
const { assignToOwner } = require('./hooks');


module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: [],
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [assignToOwner],
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
