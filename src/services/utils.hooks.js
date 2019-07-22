const { NotFound } = require('@feathersjs/errors');

/**
 * Checks if requested user is an owner of the resource.
 * @param { string } service - name of service resource comes from
 * @param { string } queryParam - field name which allows to identify resource e.g. _id
 * @param { string } userParam - field name of user identifier in resource e.g. owner
 */
function checkOwner(service, queryParam, userParam) {
    return async function (context) {
        const { user } = context.params;
        const resourceId = context.arguments[0];

        const query = { [queryParam]: resourceId };

        const resources = await context.app.service(service).find({
            query: query,
        });

        let requestedUser = undefined;

        if (resources.length && resources[0][userParam] == user.username) {
             return context;
        } else {
            throw new NotFound();
        }
    };
}


/**
 * Injects requested user as a teachr into resource.
 */
function setOwner(fieldName) {
    return function (context) {
        const { user } = context.params;

        if (user !== undefined) {
             context.data[fieldName] = user.username;
        }

        return context;
    };
}

/**
 * Adds teacher parameter into query where teacher field comes from requested
 * user.
 */
function filterOwnedBy(fieldName) {
    return function (context) {
        const { user } = context.params;

        if (user !== undefined && user.permissions.includes('admin')) {
            context.params.query[fieldName] = user.username;
        }

        return context;
    };
}

function isAdmin(context) {
    const { user } = context.params;

    if (user === undefined || !user.permissions.includes('admin')) {
        throw new Error('Only teacher can create, update or modify classes.');
    }

    return context;
}

module.exports = { checkOwner, filterOwnedBy, setOwner, isAdmin };
