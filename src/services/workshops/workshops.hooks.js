const { authenticate } = require('@feathersjs/authentication').hooks;

const {
    assignToOwner,
    checkIfExists,
    checkXMLChanged,
    propertiesFirstChanged,
} = require('./hooks');

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [],
        get: [],
        create: [checkIfExists],
        update: [checkXMLChanged, propertiesFirstChanged],
        patch: [checkXMLChanged, propertiesFirstChanged],
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
