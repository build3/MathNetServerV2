const log = require('./logger');

/**
 * Join a channel given a user and connection.
 */
const joinChannels = (app, user, connection) => {
    // Keep a reference to all authenticated users.
    app.channel('authenticated').join(connection);

    // Subscribe user to all attended workshops.
    // Assumes that the workshop assignment is stored
    // on an array of the user.
    user.workshops.forEach(workshopId =>
        app.channel(`workshops/${workshopId}`).join(connection)
    );

    if (user.permissions.includes('admin')) {
        app.channel('admins').join(connection);
    }

    if (user.permissions.includes('student')) {
        app.channel('students').join(connection);
    }
};

/**
 * Get a user to leave all channels.
 */
const leaveChannels = (app, user) => {
    app.channel(app.channels).leave((connection) => {
        connection = fixConnection(connection);

        try {
            return connection.user.username === user.username;
        } catch (error) {
            return true;
        }
    });
};

/**
 * Leave and re-join all channels with new user information.
 */
const updateChannels = (app, user) => {
    // Find all connections for this user.
    const { connections } = app.channel(app.channels).filter(connection => {
        connection = fixConnection(connection);

        try {
            // Remove connection which do not have Authorization header.
            return connection.user.username === user.username
                && connection.headers.hasOwnProperty('Authorization');
        } catch (error) {
            return false;
        }
    });

    // assert(connections.length == 1);

    // Sometimes (it's rare) connections are empty and then joinChannels
    // function throws an error and server is killed because there're no
    // connections to leave and then re-join.
    if (connections.length === 1) {
        // Leave all channels.
        leaveChannels(app, user);

        // Re-join all channels with the updated user information.
        joinChannels(app, user, connections[0]);
    }
};

function elementCreated(element, context) {
    log.info('Element created: ', element.name);
}

function elementModified(element, context) {
    log.info('Element modified: ', element.name);
}

function elementRemoved(element, context) {
    log.info('Element removed: ', element.name);
}

function workshopCreated(workshop, context) {
    log.info('Workshop created: ', workshop);
}

function workshopModified(workshop, context) {
    log.info('Workshop modified: ', workshop);

    if (context.data.xmlChanged) {
        context.service.emit('xml-changed', workshop, context);
    }
}

async function workshopRemoved(workshop, context) {
    const user = context.params.user;

    await context.app.service('users').patch(user.username,
        { workshops: user.workshops.filter(ws => ws !== workshop.id) });

    log.info('Workshop removed: ', workshop);
}

/**
 * XXX: Fix for https://github.com/feathersjs/feathers/issues/941
 * This was addressed in version 4.0.0, which is currently in
 * pre-release. Update when release is stable.
 */
function fixConnection(connection) {
    const _connection = Object.getOwnPropertySymbols(connection);

    if (!connection.user && _connection.length > 0) {
        connection = connection[_connection[0]]._feathers;
    }

    return connection;
}

module.exports = (app) => {
    if (typeof app.channel !== 'function') {
        // If no real-time functionality has been configured just return.
        return;
    }

    app.on('connection', (connection) => {
        // On a new real-time connection, add it to the anonymous channel.
        app.channel('anonymous').join(connection);
        log.info('New anonymous connection');
    });

    app.on('login', (authResult, { connection }) => {
        // Connection can be undefined if there is no
        // real-time connection, e.g. when logging in via REST.
        if (connection) {
            log.info('Login user: ', connection.user.username);

            joinChannels(app, connection.user, connection);

            // The connection is no longer anonymous, remove it.
            app.channel('anonymous').leave(connection);
        }
    });

    app.on('logout', (payload, { connection }) => {
        connection = fixConnection(connection);

        if (connection && connection.user) {
            // When logging out, leave all channels and join anonymous channel.
            leaveChannels(app, connection.user);
            app.channel('anonymous').join(connection);
        }
    });

    app.service('elements').on('created', elementCreated);
    app.service('elements').on('updated', elementModified);
    app.service('elements').on('patched', elementModified);
    app.service('elements').on('removed', elementRemoved);

    app.service('workshops').on('created', workshopCreated);
    app.service('workshops').on('patched', workshopModified);
    app.service('workshops').on('updated', workshopModified);
    app.service('workshops').on('removed', workshopRemoved);

    // On `updated` and `patched`, leave and re-join with new room assignments.
    app.service('users').on('updated', user => updateChannels(app, user));
    app.service('users').on('patched', user => updateChannels(app, user));

    // On `removed`, remove the connection from all channels
    app.service('users').on('removed', user => leaveChannels(app, user));

    app.publish((data, hook) => {
        // Here you can add event publishers to channels set up in `channels.js`
        // To publish only for a specific event use `app.publish(eventname, () => {})`

        log.info('Publishing all events to all authenticated users.');

        // e.g. to publish all service events to all authenticated users use
        return app.channel('authenticated');
    });

    const actions = ['created', 'updated', 'patched', 'removed', 'xml-changed'];
    const services = [
        { service: 'workshops', getWorkshop: (workshop => workshop.id) },
        { service: 'elements', getWorkshop: (element => element.workshop) },
    ];

    services.forEach(({ service, getWorkshop }) => {
        actions.forEach(action => {
            app.service(service).publish(action, (entity, hook) => {
                return app.channel(`workshops/${getWorkshop(entity)}`)
                    .filter(connection => connection.user.username !== hook.params.user.username
                        || hook.params.user.permissions.includes('admin'));
            });
        });
    });
};
