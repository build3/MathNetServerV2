function XMLChanged(context) {
    if (context.data.hasOwnProperty('xml')) {
        context.service.emit('xml-changed', { workshop: context.result });
    }
}

async function assignToOwner({ params: { user: owner }, app, result }) {
    const users = app.service('users');

    await users.patch(owner.username, {
        workshops: [...owner.workshops, result.id],
    });
}

module.exports = { assignToOwner, XMLChanged };
