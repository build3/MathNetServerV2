const { NotFound } = require('@feathersjs/errors');

const getClassTeacher = async (context) => {
    const groups = await context.app.service('classes').find({
        query: { code: context.arguments[0] },
    });

    if (groups.length === 1) {
        return groups[0].teacher;
    }

    return undefined;
}

async function isOwner(context) {
    const { user } = context.params;
    const teacher = await getClassTeacher(context);

    return teacher === user.username;
}

async function checkOwner(context) {
    const isResourceOwner = await isOwner(context);

    if (isResourceOwner) {
        return context;
    }

    throw new NotFound();
}

async function setOwner(context) {
    const { user } = context.params;

    if (user !== undefined) {
        context.data['teacher'] = user.username;
    }

    return context;
}

async function filterOwned(context) {
    const { user } = context.params;

    if (user !== undefined) {
        context.params.query['teacher'] = user.username
    }

    return context;
}

module.exports = { setOwner, filterOwned, checkOwner };
