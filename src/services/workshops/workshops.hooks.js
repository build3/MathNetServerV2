const { authenticate } = require('@feathersjs/authentication').hooks;
const {
    assignToOwner,
    checkIfExists,
    checkPropertiesChanged,
    checkXMLChanged,
} = require('./hooks');

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [],
        get: [],
        create: [checkIfExists],
        update: [checkXMLChanged, checkPropertiesChanged],
        patch: [checkXMLChanged, checkPropertiesChanged],
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
