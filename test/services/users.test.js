const assert = require('assert');
const app = require('../../src/app');
const errors = require('@feathersjs/errors');
const log = require('../../src/logger');
const { clearAll, makeClient } = require('../utils');

describe('users service', () => {
    const service = app.service('users');

    beforeEach(async () => {
        await clearAll(service);
    });

    it('registered the service', () => {
        assert.ok(service, 'Registered the service');
    });

    it('creates a users', async () => {
        const user = await service.create({
            username: 'franz@kafka.eu',
            password: 'testtest',
        });

        // Check that permissions default to empty array.
        assert.deepEqual(user.permissions, []);
    });

    it('creates a user with admin permissions', async () => {
        const user = await service.create({
            username: 'franz@kafka.eu',
            password: 'testtest',
            permissions: ['admin'],
        });

        assert.deepEqual(user.permissions, ['admin']);
    });

    it('creates a user with student permissions', async () => {
        const user = await service.create({
            username: 'franz@kafka.eu',
            password: 'testtest',
            permissions: ['student'],
        });

        assert.deepEqual(user.permissions, ['student']);
    });

    it('creates a user with unexisting permissions', async () => {
        // So far there is no validation for allowed permissions.
        const user = await service.create({
            username: 'franz@kafka.eu',
            password: 'testtest',
            permissions: ['ponycorn'],
        });

        assert.deepEqual(user.permissions, ['ponycorn']);
    });

    it('fails authorization without a token', async () => {
        // Setting `provider` indicates an external request.
        const params = { provider: 'rest' };

        assert.rejects(() => service.find(params));
    });

    it('removes a user', async () => {
        // Create user.
        const user = await service.create({
            username: 'franz@kafka.eu',
            password: 'testtest',
        });

        // Check is user is in db.
        assert.equal((await service.find(user.username)).length, 1);

        // Remove user.
        await service.remove(user.username);

        // Check is user has been removed successfully.
        assert.equal((await service.find(user.username)).length, 0);
    });

    it('changes password', async () => {
        const user = await service.create({
            username: 'franz@kafka.eu',
            password: 'testtest',
        });

        await assert.rejects(async () => {
            await service.patch(user.username, { password: 'testtest2' });
        });

        const updatedUser = await service.find(user.username);

        assert.equal(user.password, updatedUser[0].password);
    });

    it('fails authorization without a token', async () => {
        // Setting `provider` indicates an external request
        const params = { provider: 'rest' };

        assert.rejects(() => service.find(params));
    });

    it('username is unique', async () => {
        await service.create({
            username: 'franz@kafka.eu',
            password: 'testtest',
        });

        assert.rejects(() => {
            service.create({
                username: 'franz@kafka.eu',
                password: 'testtest',
            });
        });
    });
});

describe('teacher end to end tests', function () {
    const repository = app.service('users');
    const host = app.get('host');
    const port = app.get('port');
    const username = 'franz';
    const password = 'testtest';

    let server;

    this.timeout(10000);

    before(async () => {
        server = app.listen(port);

        server.on('listening', async () => {
            log.info('Feathers application started on http://%s:%d', host, port);
        });
        await clearAll(repository);
    });

    beforeEach(async () => {
        clearAll(repository);

        this.requestedUser = await repository.create({
            username,
            password,
            permissions: ["admin"],
        });

        const { client, _ } = await makeClient({ username, password });
        this.service = client.service('users');
    });

    after(async () => {
        server.close();
    });

    it('gets user data with single teacher', async () => {
        const users = await this.service.find();

        assert.equal(users.length, 1);
    });

    it('gets user data with single teacher and many students', async () => {
        await repository.create({
            username: 's1', password: 'password', permissions: ['student'],
        });
        await repository.create({
            username: 's2', password: 'password', permissions: ['student'],
        });
        await repository.create({
            username: 's3', password: 'password', permissions: ['student'],
        });

        const users = await this.service.find();

        assert.equal(users.length, 4);
    });

    it('changes requested user password', async () => {
        await this.service.patch(
            this.requestedUser.username, { password: 'secretpassword' },
        );

        const updatedUser = await repository.get(this.requestedUser.username);

        assert.notEqual(this.requestedUser.password, updatedUser.password);
    });

    it('changes password of other user', async () => {
        const otherUser = await repository.create({
            username: 'adam@kafka.eu',
            password: 'secret',
            permissions: ['student'],
        });

        await assert.rejects(async () => {
            await this.service.patch(
                otherUser.username, { password: 'password' },
            );
        });

        const updatedUser = await repository.get(otherUser.username);

        assert.equal(otherUser.password, updatedUser.password);
    });

    it('removes self account', async () => {
        await assert.rejects(async () =>
            await this.service.remove(this.requestedUser.username),
        );

        const users = await repository.find({
            query: { username: this.requestedUser.username },
        });

        assert.equal(users.length, 1);
    });

    it('removes account of other user', async () => {
        const otherUser = await repository.create({
            username: 'adam@kafka.eu',
            password: 'secret',
            permissions: ['student'],
        });

        await assert.rejects(async () => {
            await this.service.remove(otherUser.username);
        });

        const users = await repository.find({ query: { username: otherUser.username } });

        assert.equal(users.length, 1);
    });
});

describe('unathenticated user end to end tests', function () {
    const repository = app.service('users');
    const host = app.get('host');
    const port = app.get('port');

    let server;

    this.timeout(10000);

    before(async () => {
        server = app.listen(port);

        server.on('listening', async () => {
            log('Feathers application started on http://%s:%d', host, port);
        });
    });

    beforeEach(async () => {
        await clearAll(repository);

        const { client, _ } = await makeClient();
        this.service = client.service('users');
    });

    after(async () => {
        server.close();
    });

    it('creates an account', async () => {
        const response = await this.service.create({
            username: 'franz',
            password: 'test',
            permissions: ['admin'],
        });

        const user = await repository.get(response.username);

        assert.equal(response.password, undefined);
        assert.equal(user.username, response.username);
        assert.deepEqual(user.permissions, response.permissions);
    });

    it('lists users', async () => {
        await assert.rejects(async () => {
            await this.service.find();
        });
    });

    it('updates user', async () => {
        const user = await repository.create({
            username: 'adam@kafka.eu',
            password: 'secret',
            permissions: ['student'],
        });

        await assert.rejects(async () => {
            await this.service.patch(user.username, { username: 'franz' });
        });
    });
});

describe('student end to end tests', function () {
    const repository = app.service('users');
    const host = app.get('host');
    const port = app.get('port');
    const username = 'franz';
    const password = 'testtest';

    let server;

    this.timeout(10000);

    before(async () => {
        server = app.listen(port);

        server.on('listening', async () => {
            log('Feathers application started on http://%s:%d', host, port);
        });
    });

    beforeEach(async () => {
        await clearAll(repository)

        this.requestedUser = await repository.create({
            username,
            password,
            permissions: ['student'],
        });

        const { client, _ } = await makeClient({ username, password });
        this.service = client.service('users');
    });

    after(async () => {
        server.close();
    });

    it('lists users', async () => {
        await repository.create({
            username: 'teacher', password: 'password', permissions: ['admin'],
        });

        await assert.rejects(async () => {
            await this.service.find();
        });
    });

    it('gets self account', async () => {
        const user = await this.service.get(this.requestedUser.username);

        assert.equal(this.requestedUser.username, user.username);
    });

    it('gets accounts of other user', async () => {
        const user = await repository.create({
            username: 'adam',
            password: 'test',
            permissions: ['student'],
        });

        await assert.rejects(async () => {
            await this.service.get(user.username);
        });
    });

    it('removes self account', async () => {
        await assert.rejects(async () => {
            await this.service.remove(this.requestedUser.username);
        });

        const users = await repository.find({
            query: { username: this.requestedUser.username },
        });

        assert.equal(users.length, 1);
    });

    it('removes account of other user', async () => {
        const otherUser = await repository.create({
            username: 'adam@kafka.eu',
            password: 'secret',
            permissions: ['student'],
        });

        await assert.rejects(async () => {
            await this.service.remove(otherUser.username);
        });

        const users = await repository.find({ query: { username: otherUser.username } });

        assert.equal(users.length, 1);
    });
});
