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
 * Checks if `properties` property changed in workshop.
 *
 * @param {Object} properties - current value.
 * @param {Object} data - new value.
 */
function propertiesChanged({ properties }, data) {
    return JSON.stringify(properties) !== JSON.stringify(data.properties);
}

/**
 * Checks if `xml` property changed in workshop.
 *
 * @param {String} xml - current value.
 * @param {Object} data - new value.
 */
function xmlChanged({ xml }, data) {
    return xml !== data.xml;
}

/**
 * Returns true when `xml` or `properties` have changed inside workshop.
 * Otherwise returns false.
 *
 * @param {Object} workshop - current workshop data.
 * @param {Object} data - new workshop data.
 */
function contextChanged(workshop, { data }) {
    if (data.hasOwnProperty('xml') && !data.hasOwnProperty('properties')) {
        return xmlChanged(workshop, context);
    }

    if (!data.hasOwnProperty('xml') && data.hasOwnProperty('properties')) {
        return propertiesChanged(workshop, data);
    }

    if (data.hasOwnProperty('xml') && data.hasOwnProperty('properties')) {
        return xmlChanged(workshop, data) || propertiesChanged(workshop, data);
    }

    return false;
}

/**
 * Checks if xml or properties value sent by user is different then one in current workshop.
 * If value is different set `xmlChanged` parameter to true, otherwise set it to false
 */
async function checkXMLChanged(context) {
    const workshop = await context.app.service('workshops').get(context.id);

    context.data.xmlChanged = contextChanged(workshop, context);

    return context;
}

function checkFirstProperties({ propertiesFirst }, { data }) {
    return JSON.stringify(propertiesFirst) !== JSON.stringify(data.propertiesFirst);
}

async function checkPropertiesFirstChanged(context) {
    const workshop = await context.app.service('workshops').get(context.id);

    if (context.data.hasOwnProperty('propertiesFirst')) {
        context.data.propertiesChanged = checkFirstProperties(workshop, context);
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

module.exports = { assignToOwner, checkIfExists, checkXMLChanged, checkPropertiesFirstChanged };
