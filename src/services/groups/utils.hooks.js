const checkPermissions = require('feathers-permissions');
const { preventChanges } = require('feathers-hooks-common');
const { NotFound } = require('@feathersjs/errors');

const getGroupTeacher = async (context) => {
    const groups = await context.app.service('groups').find({
            query: { _id: context.arguments[0] },
        });

    if (groups.length == 1) {
        return groups[0].teacher
    }

    return undefined
}

async function isOwner(context) {
    const { user } = context.params;
    const teacher = await getGroupTeacher(context)
    return teacher == user.username
}

async function checkOwner(context) {
    const user = context.params.user;
    const isResourceOwner = await isOwner(context);

    if (isResourceOwner) {
        return context;
    }

    throw new NotFound();
}

async function setOwner(context) {
    const user = context.params.user;

    if (context.params.user !== undefined) {
        context.data['teacher'] = user.username
    }

    return context
}

async function filterOwned(context) {
    const user = context.params.user;

    if (context.params.user !== undefined) {
        context.params.query['teacher'] = user.username
    }

    return context;
}

module.exports = { setOwner, filterOwned, checkOwner };
