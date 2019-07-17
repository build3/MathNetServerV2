const assert = require('assert');

const app = require('../src/app');

const {
    clearAll,
    makeClient,
    channelLength,
    assertIncreased,
    assertDecreased,
    assertChannelLengthIs,
    assertChannelEmpty,
} = require('./utils');

const port = app.get('port');

const user = {
    username: 'gauss',
    password: 'secret',
    permissions: ['admin'],
    strategy: 'local',
};

const student = {
    username: 'testStudent',
    password: 'secret',
    permissions: ['student'],
    strategy: 'local',
};

describe.only('Application\'s channel management tests', () => {
    const users = app.service('users');

    let server;
    let client;

    before(async () => {
        server = app.listen(port);

        await clearAll(users);
        await users.create(user);
        await users.create(student);
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

            await client.authenticate(user);

            assertDecreased(anonLen, 'anonymous');
            assertIncreased(authLen, 'authenticated');
        });

        it('removes user from "authenticated" channel on logout"', async () => {
            // Ensure that user is logged-in before the test.
            await client.authenticate(user);

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
                password: 'secret',
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
        });

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

        it('removes user from students channel after logout', async () => {
            await users.create({
                username: 'student2',
                password: 'secret',
                permissions: ['student'],
            });

            client.logout();

            await client.authenticate({
                strategy: 'local',
                username: 'student2',
                password: 'secret',
            });

            const studLen = channelLength('students');

            await client.logout();

            assertDecreased(studLen, 'students');
        });

        it('removes user from admins channel after logout', async () => {
            await client.authenticate(user);

            const adminLen = channelLength('admins');

            await client.logout();

            assertDecreased(adminLen, 'admins');
        });

        it('check admin rejoin admins after update', async () => {
            client.logout();

            await client.authenticate(user);

            const adminLen = channelLength('admins');

            await users.update(user.username, user);

            assertChannelLengthIs('admins', adminLen);

            client.logout();
        });

        it('check admin rejoin admins after patch', async () => {
            client.logout();

            await client.authenticate(user);

            const adminLen = channelLength('admins');

            await users.patch(user.username, {
                password: 'secret2',
            }, { user });

            assertChannelLengthIs('admins', adminLen);

            client.logout();
        });

        it('check student rejoin students after update', async () => {
            client.logout();

            await client.authenticate(student);

            const studentsLen = channelLength('students');

            await users.update(student.username, student);

            assertChannelLengthIs('students', studentsLen);

            client.logout();
        });

        it('check student rejoin students after patch', async () => {
            client.logout();

            await client.authenticate(student);

            const studentsLen = channelLength('students');

            await users.patch(student.username, {
                password: 'secret',
            }, { user: student });

            assertChannelLengthIs('students', studentsLen);

            client.logout();
        });
    });
});
