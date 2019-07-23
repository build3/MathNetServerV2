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
    workshops: [],
};

const student = {
    username: 'testStudent',
    password: 'secret',
    permissions: ['student'],
    strategy: 'local',
};

const NOT_BELONG = 'User received event from workshop he doesn\'t belong to';

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
                password: 'secret',
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

        it('removes student from students channel when loses permission', async () => {
            client.logout();

            await client.authenticate(student);

            const studentsLen = channelLength('students');

            await users.patch(student.username, {
                permissions: [],
            }, { user: student });

            assertDecreased(studentsLen, 'students');

            client.logout();
        });

        it('removes admin from admins channel when loses permission', async () => {
            client.logout();

            await client.authenticate(user);

            const adminLen = channelLength('admins');

            await users.patch(user.username, {
                permissions: [],
            }, { user });

            assertDecreased(adminLen, 'admins');

            client.logout();
        });

        it('adds student to students channel when loses permission', async () => {
            client.logout();

            await client.authenticate(student);

            const studentsLen = channelLength('students');

            await users.patch(student.username, {
                permissions: ['student'],
            }, { user: student });

            assertIncreased(studentsLen, 'students');

            client.logout();
        });

        it('adds admin to admins channel when loses permission', async () => {
            client.logout();

            await client.authenticate(user);

            const adminLen = channelLength('admins');

            await users.patch(user.username, {
                permissions: ['admin'],
            }, { user });

            assertIncreased(adminLen, 'admins');

            client.logout();
        });
    });
});

describe.only('Element\'s event propagation into channels', () => {
    const users = app.service('users');
    const elements = app.service('elements');

    let server;
    let client;
    let workshop;
    let workshops;

    before(async () => {
        server = app.listen(port);

        await users.create(user);

        ({ client, _ } = await makeClient());

        workshops = client.service('workshops');

        await client.authenticate(user);
    });

    beforeEach(async () => {
        workshop = await workshops.create({
            xml: '<xml />',
            name: 'workshop',
        });
    });

    after(() => {
        server.close();
    });

    it('user receives event when element belonging to workshop is created', async () => {
        const elementData = {
            name: 'name',
            workshop: workshop.id,
            xml: '<xml />',
        };

        return new Promise((resolve) => {
            client.service('elements').once('created', data => {
                assert.deepEqual(data.workshop, workshop.id);
                resolve();
            });

            elements.create(elementData);
        });
    });

    it('user receives event when element belonging to workshop is created', async () => {
        const user2 = {
            username: 'user2',
            password: 'secret',
            strategy: 'local',
        };

        const otherWorkshop = await workshops.create({
            xml: '<xml />',
            name: 'workshop',
        });

        await client.logout();

        await users.create(user2);

        await client.authenticate(user2);

        const elementData = {
            name: 'name',
            workshop: otherWorkshop.id,
            xml: '<xml />',
        };

        client.service('elements').once('created', () => assert.fail(NOT_BELONG));

        await elements.create(elementData);
    });
});

describe.only('Workshop\'s event propagation into channels', () => {
    const users = app.service('users');

    let server;
    let client;
    let workshop;
    let workshops;

    before(async () => {
        server = app.listen(port);

        await users.create(user);

        ({ client, _ } = await makeClient());

        workshops = client.service('workshops');

        await client.authenticate(user);
    });

    beforeEach(async () => {
        workshop = await workshops.create({
            xml: '<xml />',
            name: 'workshop',
        });
    });

    after(() => {
        server.close();
    });

    it('creates new channel when workshop is created', async () => {
        const newWorkshop = {
            xml: '<xml />',
            name: 'workshop',
        };

        const len = app.channels.length;

        await workshops.create(newWorkshop);

        assert.equal(len + 1, app.channels.length);
    });

    it('user receives event when workshop is created', async () => {
        return new Promise((resolve) => {
            client.service('workshops').once('created', data => {
                assert.deepEqual(data.id, workshop.id);
                resolve();
            });

            workshops.create(workshop);
        });
    });

    it('user receives event when workshop is removed', async () => {
        const workshopNew = await workshops.create({
            name: 'name',
            xml: '<xml />',
        });

        return new Promise((resolve) => {
            client.service('workshops').on('removed', data => {
                assert.deepEqual(data.id, workshopNew.id);
                resolve();
            });

            workshops.remove(workshopNew.id);
        });
    });

    it('user receives xml-changed', async () => {
        const workshopNew = await workshops.create({
            name: 'name',
            xml: '<xml />',
        });

        return new Promise((resolve) => {
            client.service('workshops').on('xml-changed', data => {
                assert.deepEqual(data.workshop.id, workshopNew.id);
                resolve();
            });

            workshops.update(workshopNew.id, workshopNew);
        });
    });

    it('user does not receives xml-changed', async () => {
        const workshopNew = await workshops.create({
            name: 'name',
            xml: '<xml />',
        });

        client.service('workshops').on('xml-changed', () => assert.fail(NOT_BELONG));

        await workshops.patch(workshopNew.id, { name: 'test' });
    });

    it('does not send event when workshop is removed if workshop does not belong to user', async () => {
        const user2 = {
            username: 'test',
            password: 'secret',
            permissions: ['admin'],
            strategy: 'local',
        };

        await client.logout();

        await users.create(user2);

        await client.authenticate(user2);

        const workshopNew = await workshops.create({
            name: 'name',
            xml: '<xml />',
        });

        await client.logout(user2);

        await client.authenticate(user);

        client.service('workshops').once('removed', () => assert.fail(NOT_BELONG));

        await workshops.remove(workshopNew.id);
    });
});
