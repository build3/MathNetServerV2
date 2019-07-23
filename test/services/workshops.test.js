const { NotFound } = require('@feathersjs/errors');
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
    name: 'workshop',
};

describe.only('\'workshops\' service', () => {
    const users = app.service('users');

    let server;
    let client;
    let service;
    let workshop;

    before(async () => {
        server = app.listen(port);

        clearAll(users);
        await users.create(user);
        await users.create(student);

        ({ client, _ } = await makeClient());

        service = client.service('workshops');
    });

    after(() => {
        server.close();
    });

    describe.only('Application', async () => {
        it('adds user with workshops to appriopriate workshops channels on login', async () => {
            await client.authenticate(user);

            workshop = await service.create({
                xml: '<xml />',
                name: 'workshop',
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
        it('sets owner when admin creates new workshop', async () => {
            await client.authenticate(user);

            const createdWorkshop = await service.create(testWorkshop);

            assert.deepEqual(createdWorkshop.owner, user.username);

            await client.logout();
        });

        it('sets owner when student creates new workshop', async () => {
            await client.authenticate(student);

            const createdWorkshop = await service.create(testWorkshop);

            assert.deepEqual(createdWorkshop.owner, student.username);

            await client.logout();
        });

        it('adds workshop to admin workshops after creation', async () => {
            await client.authenticate(user);

            const createdWorkshop = await service.create(testWorkshop);

            const userData = await users.get(user.username);

            assert.ok(userData.workshops.includes(createdWorkshop.id));

            await client.logout();
        });

        it('adds workshop to student workshops after creation', async () => {
            await client.authenticate(student);

            const createdWorkshop = await service.create(testWorkshop);

            const userData = await users.get(student.username);

            assert.ok(userData.workshops.includes(createdWorkshop.id));

            await client.logout();
        });

        it('removes from admin workshops after workshop is removed', async () => {
            await client.authenticate(user);

            const createdWorkshop = await service.create(testWorkshop);

            await service.remove(createdWorkshop.id);

            const userData = await users.get(user.username);

            assert.ok(!userData.workshops.includes(createdWorkshop.id));

            await client.logout();
        });

        it('removes from student workshops after workshop is removed', async () => {
            await client.authenticate(student);

            const createdWorkshop = await service.create(testWorkshop);

            await service.remove(createdWorkshop.id);

            const userData = await users.get(student.username);

            assert.ok(!userData.workshops.includes(createdWorkshop.id));

            await client.logout();
        });

        it('does not removes workshop not owned by authenticated user', async () => {
            await client.authenticate(user);

            const createdWorkshop = await service.create(testWorkshop);

            await client.logout();

            await client.authenticate(student);

            assert.rejects(async () => {
                await service.remove(createdWorkshop.id);
            });

            await client.logout();
        });

        it('does not updates workshop not owned by authenticated user', async () => {
            await client.authenticate(user);

            const createdWorkshop = await service.create(testWorkshop);

            await client.logout();

            await client.authenticate(student);

            assert.rejects(async () => {
                await service.update(createdWorkshop.id, createdWorkshop);
            });

            await client.logout();
        });
    });
});
