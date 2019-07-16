const assert = require('assert');
const app = require('../../src/app');
const log = require('../../src/logger');
const { clearAll, makeClient } = require('../utils');

describe('groups management by student', function () {
    const users = app.service('users');
    const groups = app.service('groups');
    const host = app.get('host');
    const port = app.get('port');

    const username = 'franz';
    const password = 'testtest';
    const defaultClassJson = {
        teacher: username,
        class: 'adam\'s class',
    };

    let server;
    let service;

    this.timeout(10000);

    before(async () => {
        server = app.listen(port);

        users.options.multi = true;
        await users.remove(null);
        users.options.multi = false;

        await users.create({
            username,
            password,
            permissions: ['student'],
        });

        const { client, _ } = await makeClient({ username, password });

        service = client.service('groups');
    });

    beforeEach(async () => {
        await clearAll('groups');
    });

    it('lists groups', async () => {
        groups.create(defaultClassJson);

        await assert.rejects(async () => {
            await service.find();
        });
    });

    it('creates groups', async () => {
        await assert.rejects(async () => {
            await service.create(defaultClassJson);
        });
    });

    it('updates groups', async () => {
        const group = groups.create(defaultClassJson);

        await assert.rejects(async () => {
            await service.update(group._id, group._id, {
                teacher: 'franz',
                class: 'franz\'s class',
            });
        });
    });

    it('patches groups', async () => {
        const group = groups.create(defaultClassJson);

        await assert.rejects(async () => {
            await service.patch(group._id, {
                teacher: 'franz',
                class: 'franz\'s class',
            });
        });
    });

    it('removes groups', async () => {
        const group = groups.create(defaultClassJson);

        await assert.rejects(async () => {
            await service.remove(group._id);
        });
    });
});


describe('groups management by teacher', function () {
    const users = app.service('users');
    const groups = app.service('groups');
    const host = app.get('host');
    const port = app.get('port');

    const username = 'franz';
    const otherUsername = 'adam';
    const password = 'testtest';
    const defaultClassJson = {
        teacher: username,
        class: 'franz\'s class',
    };

    let server;
    let service;

    this.timeout(10000);

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

        const { client, _ } = await makeClient({ username, password });

        service = client.service('groups');
    });

    beforeEach(async () => {
        await app.settings.mongooseClient.connection.db.collection('groups').drop();
    });

    it('lists groups', async () => {
        const otherUserClassData = {
            teacher: otherUsername,
            class: 'adam\'s class',
        };

        await groups.create(defaultClassJson);
        await groups.create(defaultClassJson);
        await groups.create(defaultClassJson);

        await groups.create(otherUserClassData);
        await groups.create(otherUserClassData);

        const result = await service.find();

        assert.equal(result.length, 3);
    });

    it('creates groups', async () => {
        const group = await service.create(defaultClassJson);

        const existingGroups = await groups.find({
            query: { teacher: username },
        });

        assert.equal(existingGroups.length, 1);
        assert.equal(existingGroups[0]._id, group._id);
    });

    it('patches own group', async () => {
        const group = await groups.create(defaultClassJson);
        const className = 'changed class';

        await service.patch(group._id, {
            class: className,
        });

        const updatedGroup = await groups.get(group._id);

        assert.equal(updatedGroup.class, className);
    });

    it('does not patch group of other user', async () => {
        const className = 'class name';
        const group = await groups.create({
            teacher: otherUsername,
            class: className,
        });

        await assert.rejects(async () => {
            await service.patch(group._id, { class: 'changed class name' });
        });

        const updatedGroup = await groups.get(group._id);

        assert.equal(updatedGroup.class, className);
    });

    it('removes own group', async () => {
        const group = await groups.create(defaultClassJson);

        await service.remove(group._id);

        const existingGroups = await groups.find({
            query: { teacher: username },
        });

        assert.equal(existingGroups.length, 0);
    });

    it('does not remove group of other user', async () => {
        const group = await groups.create({
            teacher: otherUsername,
            class: 'class name',
        });

        await assert.rejects(async () => {
            await service.remove(group._id);
        });

        const existingGroups = await groups.find({
            query: { teacher: otherUsername },
        });

        assert.equal(existingGroups.length, 1);
    });
});
