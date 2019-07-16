const assert = require('assert');

const app = require('../src/app');
const { clearAll, makeClient } = require('./utils');

const port = app.get('port');

const user = {
    username: 'gauss',
    password: 'secret',
    permissions: ['admin'],
};

async function authenticate(client, { username, password } = 
        { username: user.username, password: user.password }) {
    await client.authenticate({
        strategy: 'local',
        username: username,
        password: password,
    });
}

describe.only('Application\'s channel management tests', () => {
    const users = app.service('users');

    let server;
    let client;

    before(async () => {
        server = app.listen(port);

        await clearAll(users);
        await users.create(user);
        ({ client, _ } = await makeClient());

        assertChannelEmpty('anonymous', 0);
        assertChannelEmpty('authenticated', 0);
    });

    after(() => {
        server.close();
    });

    describe('Application', async () => {
        it('saves authenticated users to "authenticated" channel', async () => {
            const anonLen = channelLength('anonymous');
            const authLen = channelLength('authenticated');

            await authenticate(client);

            assertDecreased(anonLen, 'anonymous');
            assertIncreased(authLen, 'authenticated');
        });

        it('removes user from "authenticated" channel on logout"', async () => {
            // Ensure that user is logged-in before the test.
            await await authenticate(client);

            // Save state before the test.
            const anonLen = channelLength('anonymous');          
            const authLen = channelLength('authenticated');

            await client.logout();

            assertIncreased(anonLen, 'anonymous');            
            assertDecreased(authLen, 'authenticated');
        });

        it('removes removed users from their channels', async () => {
            // Create and log-in new user.
            const user = await users.create({
                username: 'newton',
                password: 'secret'
            });

            await client.authenticate({
                strategy: 'local',
                username: 'newton',
                password: 'secret',
            });

            // Save state before the test.
            const authLen = channelLength('authenticated');
            const anonLen = channelLength('anonymous');

            await users.remove(user.username);

            // Check that removed user was removed from authenicated.
            assertDecreased(authLen, 'authenticated');
            // Check that anonymous channel did not change.
            assertChannelLengthIs('anonymous', anonLen);
        })

        it('adds teacher to channel "admins"', async () => {
            await users.create({
                username: 'teacher',
                password: 'secret',
                permissions: ['admin'],
            });            

            // Ensure that there are no other users in "admins" channel.
            // In other case, authenicate would remove them 
            // (so that number of users in the channel does not change).
            client.logout();

            // Save state before the test.
            const adminLen = channelLength('admins');

            await client.authenticate({
                strategy: 'local',
                username: 'teacher',
                password: 'secret',
            });

            assertIncreased(adminLen, 'admins');
        });

        it('adds student to channel "students"', async () => {
            await users.create({
                username: 'student',
                password: 'secret',
                permissions: ['student'],
            });            

            client.logout();

            // Save state before the test.
            const studLen = channelLength('students');

            await client.authenticate({
                strategy: 'local',
                username: 'student',
                password: 'secret',
            });

            assertIncreased(studLen, 'students');
        });
    });
});

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