const assert = require('assert');
const app = require('../../src/app');

const { clearAll, makeClient } = require('../utils');

describe('Application\'s class management', () => {
    const users = app.service('users');
    const host = app.get('host');
    const port = app.get('port');

    const username = 'franz';
    const otherUsername = 'adam';
    const password = 'testtest';

    const defaultClassJson = {
        name: 'franz\'s class',
        code: 'code',
    };

    const user = {
        username,
        password,
        permissions: ['admin'],
        strategy: 'local',
    };

    const otherUser = {
        username: otherUsername,
        password,
        permissions: ['admin'],
        strategy: 'local',
    };

    let server;
    let service;
    let client;

    before(async () => {
        server = app.listen(port);

        users.options.multi = true;
        await users.remove(null);
        users.options.multi = false;

        await users.create({
            username,
            password,
            permissions: ['admin'],
        });

        await users.create({
            username: otherUsername,
            password,
            permissions: ['admin'],
        });

        ({ client, _ } = await makeClient());

        service = client.service('classes');
    });

    beforeEach(async () => {
        await clearAll('classes');
    });

    it('lists classes', async () => {
        await client.authenticate(user);

        const otherUserClassData = {
            name: 'other class name',
            code: '2a',
        };

        await service.create(defaultClassJson);
        await service.create(defaultClassJson);
        await service.create(defaultClassJson);

        await client.logout();

        await client.authenticate(otherUser);

        await service.create(otherUserClassData);
        await service.create(otherUserClassData);

        await client.logout();

        await client.authenticate(user);

        const result = await service.find();

        assert.equal(result.length, 3);
    }).timeout(2500);

    it('creates classes', async () => {
        await client.authenticate(user);

        const studentClass = await service.create(defaultClassJson);

        const existingClasses = await service.find({
            query: { teacher: username },
        });

        assert.equal(existingClasses.length, 1);
        assert.equal(existingClasses[0].code, studentClass.code);
    });

    it('patches own class', async () => {
        await client.authenticate(user);

        const studentClass = await service.create(defaultClassJson);
        const className = 'changed class';

        await service.patch(studentClass.code, {
            name: className,
        });

        const updatedClass = await service.get(studentClass.code);

        assert.equal(updatedClass.name, className);
    });

    it('does not patch class of other user', async () => {
        await client.logout();

        await client.authenticate(otherUser);

        const className = 'class name';
        const studentClass = await service.create({
            name: className,
            code: '4a',
        });

        await client.logout();

        await client.authenticate(user);

        assert.rejects(async () => {
            await service.patch(studentClass.code, { class: 'changed class name' });
        });

        await client.logout();

        await client.authenticate(otherUser);

        const updatedClass = await service.get(studentClass.code);

        assert.equal(studentClass.name, updatedClass.name);
    }).timeout(2500);

    it('removes own class', async () => {
        await client.authenticate(user);

        const studentClass = await service.create(defaultClassJson, { user });

        await service.remove(studentClass.code, { user });

        const existingClasses = await service.find({
            query: { teacher: username },
        });

        assert.equal(existingClasses.length, 0);
    });

    it('does not remove class of other user', async () => {
        await client.logout();

        await client.authenticate(otherUser);

        const studentClass = await service.create({
            name: 'class name',
            code: '4a',
        });

        await client.logout();

        await client.authenticate(user);

        await assert.rejects(async () => {
            await service.remove(studentClass.code);
        });

        await client.logout();

        await client.authenticate(otherUser);

        const existingClasses = await service.find({
            query: { teacher: otherUsername },
        });

        assert.equal(existingClasses.length, 1);
    }).timeout(2500);

    it('creates custom code when user didn\'t specify code', async () => {
        await client.authenticate(user);

        const newClass = await service.create({
            name: 'test',
        });

        assert.ok(newClass.hasOwnProperty('code'));
    });

    it('creates custom code when empty code was sent', async () => {
        await client.authenticate(user);

        const code = '';

        const newClass = await service.create({
            name: 'test',
            code,
        });

        assert.ok(newClass.hasOwnProperty('code'));
        assert.notDeepEqual(code, newClass);
    });

    it('does not override code when it was sent', async () => {
        await client.authenticate(user);

        const code = 'test';

        const newClass = await service.create({
            name: 'test',
            code,
        });

        assert.deepEqual(code, newClass.code);
    });
});
