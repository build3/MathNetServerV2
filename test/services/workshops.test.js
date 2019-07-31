const assert = require('assert');

const app = require('../../src/app');

const { 
    clearAll,
    makeClient,
    channelLength,
    assertIncreased,
} = require('../utils');

const port = app.get('port');

const user = {
    username: 'teacher',
    password: 'secret',
    permissions: ['admin'],
    strategy: 'local',
};

const student = {
    username: 'student',
    password: 'secret',
    permissions: ['student'],
    strategy: 'local',
};

const testWorkshop = {
    xml: '<xml />',
};

describe.only('\'workshops\' service', () => {
    const users = app.service('users');

    let server;
    let client;
    let service;
    let workshop;
    let groups;
    let group;

    before(async () => {
        server = app.listen(port);

        clearAll(users);
        await users.create(user);
        await users.create(student);

        ({ client, _ } = await makeClient());

        service = client.service('workshops');
        groups = client.service('groups');
    });

    after(() => {
        server.close();
    });

    describe.only('Application', async () => {
        it('adds user with workshops to appriopriate workshops channels on login', async () => {
            await client.authenticate(user);

            group = await groups.create({
                name: 'Test',
                class: 'Test',
            });

            workshop = await service.create({
                id: group._id,
                xml: '<xml />',
            });

            await client.logout();

            const workshopId = workshop.id;
            const chanLen = channelLength(`workshops/${workshopId}`);

            await client.authenticate(user);

            assertIncreased(chanLen, `workshops/${workshopId}`);

            await client.logout();
        });
    });

    describe.only('Workshop hooks', async () => {
        it('adds workshop to admin workshops after creation', async () => {
            await client.authenticate(user);

            group = await groups.create({
                name: 'Test',
                class: 'Test',
            });

            testWorkshop.id = group._id;

            const createdWorkshop = await service.create(testWorkshop);

            const userData = await users.get(user.username);

            assert.ok(userData.workshops.includes(createdWorkshop.id));

            await client.logout();
        });

        it('adds workshop to student workshops after creation', async () => {
            await client.authenticate(user);

            group = await groups.create({
                name: 'Test',
                class: 'Test',
            });

            await client.logout();

            await client.authenticate(student);

            testWorkshop.id = group._id;

            const createdWorkshop = await service.create(testWorkshop);

            const userData = await users.get(student.username);

            assert.ok(userData.workshops.includes(createdWorkshop.id));

            await client.logout();
        });

        it('removes from admin workshops after workshop is removed', async () => {
            await client.authenticate(user);

            group = await groups.create({
                name: 'Test',
                class: 'Test',
            });

            testWorkshop.id = group._id;

            const createdWorkshop = await service.create(testWorkshop);

            await service.remove(createdWorkshop.id);

            const userData = await users.get(user.username);

            assert.ok(!userData.workshops.includes(createdWorkshop.id));

            await client.logout();
        });

        it('removes from student workshops after workshop is removed', async () => {
            await client.authenticate(user);

            group = await groups.create({
                name: 'Test',
                class: 'Test',
            });

            await client.logout();

            await client.authenticate(student);

            testWorkshop.id = group._id;

            const createdWorkshop = await service.create(testWorkshop);

            await service.remove(createdWorkshop.id);

            const userData = await users.get(student.username);

            assert.ok(!userData.workshops.includes(createdWorkshop.id));

            await client.logout();
        });

        it('does removes workshop not owned by authenticated user', async () => {
            await client.authenticate(user);

            group = await groups.create({
                name: 'Test',
                class: 'Test',
            });

            testWorkshop.id = group._id;

            const createdWorkshop = await service.create(testWorkshop);

            await client.logout();

            await client.authenticate(student);

            await service.remove(createdWorkshop.id);

            await client.logout();
        });

        it('does updates workshop not owned by authenticated user', async () => {
            await client.authenticate(user);

            group = await groups.create({
                name: 'Test',
                class: 'Test',
            });

            testWorkshop.id = group._id;

            const createdWorkshop = await service.create(testWorkshop);

            await client.logout();

            await client.authenticate(student);

            await service.update(createdWorkshop.id, createdWorkshop);

            await client.logout();
        });

        it('does not create workshop when one already exists', async () => {
            await client.authenticate(user);

            assert.rejects(async () => {
                await service.create(workshop);
            });

            await client.logout();
        });
    });
});
