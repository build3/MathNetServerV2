const { NotFound } = require('@feathersjs/errors');

/**
 * Checks if requested user is an owner of the resource.
 */
async function checkOwner(context, service, query) {
    const { user } = context.params;

    const resourceId = context.arguments[0];
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
}


/**
 * Injects requested user as a teachr into resource.
 */
async function setTeacherOwner(context) {
    const { user } = context.params;

    if (user !== undefined) {
        context.data['teacher'] = user.username;
    }

    return context;
}

/**
 * Adds teacher parameter into query where teacher field comes from requested
 * user.
 */
async function filterOwnedByTeacher(context) {
    const { user } = context.params;

    if (user !== undefined) {
        context.params.query['teacher'] = user.username;
    }

    return context;
}

module.exports = { checkOwner, filterOwnedByTeacher, setTeacherOwner };
