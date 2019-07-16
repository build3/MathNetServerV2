const assert = require('assert');

const app = require('../../src/app');

const { 
    clearAll,
    makeClient,
    channelLength,
    assertIncreased,
    assertDecreased,
    assertChannelLengthIs,
    assertChannelEmpty
 } = require('../utils');

const port = app.get('port');

const user = {
    username: 'teacher',
    password: 'secret',
    permissions: ['admin'],
    strategy: 'local'
};

describe.only('\'workshops\' service', () => {
    const users = app.service('users');
    const workshops = app.service('constructions');

    let server;
    let client;
    let service;

    before(async () => {
        server = app.listen(port);

        await clearAll(users, workshops);
        await users.create(user);
        ({ client, _ } = await makeClient());

        service = client.service('workshops');
    });

    after(() => {
        server.close();
    });

    describe.only('Application', async () => {
        it('adds user with workshops to appriopriate workshops channels on login', async () => {
            const workshopId = 1;
            const chanLen = channelLength(`workshops/${workshopId}`);

            await client.authenticate(user);

            assertIncreased(chanLen, `workshops/${workshopId}`);
        });
    });
});
