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
        return connection.user.username === user.username
    });
};

/**
 * Leave and re-join all channels with new user information.
 */
const updateChannels = (app, user) => {
    // Find all connections for this user.
    const { connections } = app.channel(app.channels).filter(connection =>
        connection.user.username === user.username
    );

    // Leave all channels.
    leaveChannels(app, user);

    // Re-join all channels with the updated user information.
    joinChannels(app, user, connections[0]);
};

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
};
