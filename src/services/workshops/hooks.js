function XMLChanged(context) {
    if (context.data.hasOwnProperty('xml')) {
        context.service.emit('xml-changed', { workshop: context.result });
    }
}

async function assignToOwner({ params: { user: owner }, app, result, service }) {
    const users = app.service('users');

    const user = await users.get(owner.username);

    if (!user.workshops.includes(result.id)) {
        await users.patch(owner.username, {
            workshops: [...owner.workshops, result.id],
        });
    }

    service.emit('xml-changed', { workshop: result });
}

module.exports = { assignToOwner, XMLChanged };
