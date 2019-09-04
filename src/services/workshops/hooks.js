const { BadRequest } = require('@feathersjs/errors');

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

async function checkPropertiesChanged(context) {
    const workshop = await context.app.service('workshops').get(context.id);

    if (context.data.hasOwnProperty('properties')) {
        workshop.properties !== context.data.properties ?
            context.data.propertiesChanged = true :
            context.data.propertiesChanged = false;
    } else {
        context.data.propertiesChanged = false;
    }

    return context;
}

async function checkIfExists(context) {
    const workshops = await context.app.service('workshops').find({
        query: { id: context.data.id },
    });

    if (workshops.length !== 0) {
        throw new BadRequest('Workshop with entered id already exists');
    } else {
        return context;
    }
}

module.exports = {
    assignToOwner,
    checkIfExists,
    checkPropertiesChanged,
    checkXMLChanged,
};
