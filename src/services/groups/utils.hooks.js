const { checkOwner } = require('../utils.hooks.js');

const getGroupTeacher = async (context) => {
    const groups = await context.app.service('groups').find({
        query: { _id: context.arguments[0] },
    });

    if (groups.length === 1) {
        return groups[0].teacher;
    }

    return undefined;
}

async function checkGroupOwner(context) {
    return (await checkOwner(context, getGroupTeacher))
}

module.exports = { checkGroupOwner };
