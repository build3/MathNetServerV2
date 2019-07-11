const checkPermissions = require('feathers-permissions');
const { preventChanges } = require('feathers-hooks-common');

function adminOrOwner() {
    return checkPermissions({
        roles(context) {
            const { user } = context.params;
            if (user !== undefined) {
                if (user.username == context.arguments[0]) {
                    return ['admin', 'student'];
                }
            }

            return ['admin'];
        },
    });
}

function owner() {
    return function (context) {
        const { user } = context.params;
        if (user !== undefined) {
            if (user.username == context.arguments[0]) {
                return context;
            }
        }

        return undefined;
    };
}

function preventChangesIfNotOwner(field) {
    return function (context) {
        const { user } = context.params;
        if (user !== undefined) {
            if (user.username == context.arguments[0]) {
                return context;
            }
        }

        return preventChanges(true, field);
    };
}

module.exports = { adminOrOwner, owner, preventChangesIfNotOwner };
