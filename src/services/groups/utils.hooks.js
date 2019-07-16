const { checkOwner } = require('../utils.hooks.js');

async function checkGroupOwner(context) {
    // Get group id from url.
    const groupId = context.arguments[0];
    return (await checkOwner(context, 'groups', { _id: groupId }));
}

module.exports = { checkGroupOwner };
