const checkPermissions = require('feathers-permissions');
const { preventChanges } = require('feathers-hooks-common');

function isOwner({ params: { user }, arguments: [userId, ...other] }) {
    // If user is equal to undefined then internal call is perform.
    return user === undefined || user.username === userId;
}

/**
 * Checks whether requested user is admin or owns resource.
 */
function checkAdminOrOwner() {
    return checkPermissions({
        // Returns allowed roles for request.
        roles(context) {

            if (isOwner(context)) {
                return ['admin', 'student'];
            }

            return ['admin'];
        },
    });
}

/**
 * Checks whether requested user owns resource.
 */
function checkOwner() {
    return function (context) {
        if (isOwner(context)) {
            return context;
        }

        return undefined;
    };
}

/**
 * Prevents to update `field` of resource, unless requested user is
 * an owner of the resource.
 */
function preventChangesIfNotOwner(field) {
    return function (context) {
        if (isOwner(context)) {
            return context;
        }

        return preventChanges(true, field);
    };
}

module.exports = { checkAdminOrOwner, checkOwner, preventChangesIfNotOwner };
