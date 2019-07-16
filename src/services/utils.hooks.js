const { NotFound } = require('@feathersjs/errors');

/**
 * Checks if resource is owned by teacher returned from getTeacher function.
 */
async function isOwner(context, getTeacher) {
    const { user } = context.params;
    const teacher = await getTeacher(context);

    return teacher === user.username;
}

/**
 * Checks if requested user is an owner of the resource.
 */
async function checkOwner(context, getTeacher) {
    const isResourceOwner = await isOwner(context, getTeacher);

    if (isResourceOwner) {
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
