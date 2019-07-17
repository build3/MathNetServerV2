const { NotFound } = require('@feathersjs/errors');

/**
 * Checks if requested user is an owner of the resource.
 */
function checkOwner(service, queryParam) {
    return async function (context) {
        const { user } = context.params;
        const resourceId = context.arguments[0];
        const query = {}
        query[queryParam] = resourceId

        const resources = await context.app.service(service).find({
            query: query,
        });

        let teacher = undefined;

        if (resources.length === 1) {
             teacher = resources[0].teacher;
        }

        if (teacher === user.username) {
            return context;
        }

        throw new NotFound();


        return context;
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

        if (user !== undefined) {
            context.params.query[fieldName] = user.username;
        }

        return context;
    };
}

module.exports = { checkOwner, filterOwnedBy, setOwner };
