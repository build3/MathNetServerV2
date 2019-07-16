const { checkOwner } = require('../utils.hooks.js');

async function checkClassOwner(context) {
    const classId = context.arguments[0];
    return (await checkOwner(context, 'classes', { code: classId }));
}

module.exports = { checkClassOwner };
