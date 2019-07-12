const assert = require('assert');
const app = require('../../src/app');
const log = require('../../src/logger');
const { clearAll, makeClient } = require('../utils');

describe('groups management by student', function() {
    const users = app.service('users');
    const groups = app.service('groups');
    const host = app.get('host');
    const port = app.get('port');

    const username = 'franz';
    const password = 'testtest';
    const defaultClassJson = {
        teacher: username,
        class: 'adam\'s class'
    }

    let server;
    let service;

    this.timeout(10000);

    before(async () => {
        server = app.listen(port);

        server.on('listening', async () => {
            log.info('Feathers application started on http://%s:%d', host, port);
        });

        await clearAll(users);
        await users.create({
            username,
            password,
            permissions: ['student'],
        });

        const { client, _ } = await makeClient({ username, password });

        service = client.service('groups');
    });

    beforeEach(async () => {
        await clearAll(groups);
    });

    it('lists groups', async () => {
        const group = groups.create(defaultClassJson)

        await assert.rejects(async () => {
            await service.find()
        })
    });

    it('creates groups', async () => {
        await assert.rejects(async () => {
            await service.create(defaultClassJson)
        })
    });

    it('updates groups', async () => {
        const group = groups.create(defaultClassJson)

        await assert.rejects(async () => {
            await service.update(group._id, group._id, {
                teacher: "franz",
                class: "franz's class",
            })
        })
    });

    it('patches groups', async () => {
        const group = groups.create(defaultClassJson)

        await assert.rejects(async () => {
            await service.patch(group._id, group._id, {
                teacher: "franz",
                class: "franz's class",
            })
        })
    });

    it('removes groups', async () => {
        const group = groups.create(defaultClassJson)

        await assert.rejects(async () => {
            await service.remove(group._id)
        })
    });
});


describe('groups management by unauthorized user', function() {
    const groups = app.service('groups');
    const host = app.get('host');
    const port = app.get('port');
    const defaultClassJson = {
        teacher: 'adam',
        class: 'adam\'s class'
    }

    let server;

    this.timeout(10000);

    before(async () => {
        server = app.listen(port);

        server.on('listening', async () => {
            log.info('Feathers application started on http://%s:%d', host, port);
        });
    });

    beforeEach(async () => {
        await clearAll(groups);

        const { client, _ } = await makeClient();

        service = client.service('groups');
    });

    it('lists groups', async () => {
        const group = groups.create(defaultClassJson)

        await assert.rejects(async () => {
            await service.find()
        })
    });

    it('creates groups', async () => {
        await assert.rejects(async () => {
            await service.create(defaultClassJson)
        })
    });

    it('updates groups', async () => {
        const group = groups.create(defaultClassJson)

        await assert.rejects(async () => {
            await service.update(group._id, {
                teacher: "franz",
                class: "franz's class",
            })
        })
    });

    it('patches groups', async () => {
        const group = groups.create(defaultClassJson)

        await assert.rejects(async () => {
            await service.patch(group._id, {
                class: "franz's class",
            })
        })
    });

    it('removes groups', async () => {
        const group = groups.create(defaultClassJson)

        await assert.rejects(async () => {
            await service.remove(group._id)
        })
    });
});
