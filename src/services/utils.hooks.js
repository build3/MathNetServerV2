const checkPermissions = require('feathers-permissions');
const { preventChanges } = require('feathers-hooks-common');


function isOwner(context) {
    const { user } = context.params;
    return user !== undefined && user.username == context.arguments[0];
}

/**
 * Checks wheter requested user is admin or owns resource.
 * WARNING: So far it works only for `users` endpoint.
 */
function checkAdminOrOwner() {
    return checkPermissions({
        roles(context) {
            if (isOwner(context)) {
                return ['admin', 'student'];
            }

            return ['admin'];
        },
    });
}

/**
 * Checks wheter requested user owns resource.
 * WARNING: So far it works only for `users` endpoint.
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
 * WARNING: So far it works only for `users` endpoint.
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