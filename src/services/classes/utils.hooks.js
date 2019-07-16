const { checkOwner } = require('../utils.hooks.js');

const getClassTeacher = async (context) => {
    const groups = await context.app.service('classes').find({
        query: { code: context.arguments[0] },
    });

    if (groups.length === 1) {
        return groups[0].teacher;
    }

    return undefined;
}

async function checkClassOwner(context) {
    console.log(getClassTeacher);
    return (await checkOwner(context, getClassTeacher))
}

module.exports = { checkClassOwner };
