async function assignToOwner({ params: { user: owner }, app, result, service }) {
    const users = app.service('users');

    const user = await users.get(owner.username);

    if (!user.workshops.includes(result.id)) {
        await users.patch(owner.username, {
            workshops: [...owner.workshops, result.id],
        });
    }
}

/**
 * Checks if xml value sent by user is different then one in current workshop.
 * If value is different set `xmlChanged` parameter to true, otherwise set it to false
 */
async function checkXMLChanged(context) {
    const workshop = await context.app.service('workshops').get(context.id);

    if (context.data.hasOwnProperty('xml')) {
        workshop.xml !== context.data.xml ?
            context.data.xmlChanged = true :
            context.data.xmlChanged = false;
    } else {
        context.data.xmlChanged = false;
    }

    return context;
}

module.exports = { assignToOwner, checkXMLChanged };
