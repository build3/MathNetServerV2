const { authenticate } = require('@feathersjs/authentication').hooks;
const { assignToOwner, XMLChanged } = require('./hooks');


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
        update: [XMLChanged],
        patch: [XMLChanged],
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
