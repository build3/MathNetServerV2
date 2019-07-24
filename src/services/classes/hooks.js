const mongoose = require('mongoose');
const { isUndefinedOrBlank } = require('../utils.hooks.js');

function setCode(context) {
    const { user } = context.params;

    if (user !== undefined && isUndefinedOrBlank(context.data, 'code')) {
        const id = mongoose.Types.ObjectId().toString();
        context.data.code = id;
    }

    return context;
}

module.exports = { setCode };
