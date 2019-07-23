async function setGroupName(context) {
    if (!context.data.hasOwnProperty('name') || context.data.name === '') {
        const groups = context.app.service('groups');

        await groups.patch(context.result._id, { name: `${context.result.teacher}-${context.result.class}` },
            { user: context.params.user });
    }
}

module.exports = { setGroupName };
