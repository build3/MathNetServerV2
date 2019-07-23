const { authenticate } = require('@feathersjs/authentication').hooks;
const { setOwner } = require('../utils.hooks.js');
const { assignToOwner, XMLChanged } = require('./hooks');


module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [],
        get: [],
        create: [setOwner('owner')],
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
