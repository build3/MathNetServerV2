async function setGroupName(context) {
    const groups = context.app.service('groups');

    await groups.patch(context.result._id, { name: `${context.result.teacher}-${context.result.class}` },
        { user: context.params.user });
}

module.exports = { setGroupName };
