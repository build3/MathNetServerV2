const assert = require('assert');
const feathersClient = require('@feathersjs/client');
const io = require('socket.io-client');

const app = require('../src/app');

/**
 * Create test client for e2e tests.
 * To work, it requires test server to listen on
 * configured host:port and user username:password to
 * exist on the server. Example usage:
 *
 * const host = app.get('host');
 * const port = app.get('port');
 * const username = '<username>';
 * const password = '<password>';
 *
 * this.timeout(10000);
 *
 * before(async () => {
 *     server = app.listen(port);
 *
 *     server.on('listening', async () => {
 *         console.log('Feathers application started on http://%s:%d', host, port);
 *     });
 *
 *     const { client, socket } = await makeClient(host, port, username, password);
 * });
 */

function localStorage() {
    const store = {};

    return {
        setItem(key, value) {
            store[key] = value;
        },
        getItem(key) {
            return store[key];
        },
        removeItem(key) {
            delete store[key];
        },
    };
}

async function makeClient({ username, password, host, port } = {}) {
    const authenticate = !(username === undefined && password === undefined);
    const client = feathersClient();

    host = host || app.get('host');
    port = port || app.get('port');

    const socket = io(`http://${host}:${port}`, {
        transports: ['websocket'],
        forceNew: true,
        reconnection: false,
        extraHeaders: {},
    });

    client.configure(feathersClient.socketio(socket));
    client.configure(feathersClient.authentication({
        storage: localStorage(),
    }));

    if (authenticate) {       
        await client.authenticate({
            strategy: 'local',
            username,
            password,
        });
    }

    return { client, socket };
};

async function clearAll(...services) {
    await services.forEach(async (service) => {
        const multi = service.options.multi;
        service.options.multi = true;
        await service.remove(null);
        service.options.multi = false;
    });
}

function channelLength(channelName) {
    return app.channel(channelName).length;
}

function assertIncreased(before, channel) {
    assert.equal(before + 1, channelLength(channel));
}

function assertDecreased(before, channel) {
    assert.equal(before - 1, channelLength(channel));
}

function assertChannelLengthIs(channel, length) {
    assert.equal(channelLength(channel), length);
}

function assertChannelEmpty(channel) {
    assertChannelLengthIs(channel, 0);
}

module.exports = {
    // General:
    makeClient,
    clearAll,

    // Channel-related test utils:
    channelLength,
    assertIncreased,
    assertDecreased,
    assertChannelLengthIs,
    assertChannelEmpty
}
