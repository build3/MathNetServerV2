const feathersClient = require('@feathersjs/client');
const io = require('socket.io-client');

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
async function makeClient(host, port, username, password) {
    const client = feathersClient();

    const socket = io(`http://${host}:${port}`, {
        transports: ['websocket'],
        forceNew: true,
        reconnection: false,
        extraHeaders: {}
    });

    client.configure(feathersClient.socketio(socket));
    client.configure(feathersClient.authentication({
        storage: localStorage()
    }));

    await client.authenticate({
        strategy: 'local',
        username,
        password,
    });

    return { client, socket };
}

function localStorage () {
    const store = {};

    return {
        setItem (key, value) {
            store[key] = value;
        },
        getItem (key) {
            return store[key];
        },
        removeItem (key) {
            delete store[key];
        }
    };
}

async function clearAll(...services) {
    services.forEach(async (service) => {
        service.options.multi = true;
        await service.remove(null);
        service.options.multi = false;
    });
}

module.exports = {
    makeClient,
    clearAll
}