const assert = require('assert');
const app = require('../../src/app');
const log = require('../../src/logger');

describe('users service', () => {
    const service = app.service('users');

    beforeEach((done) => {
        // XXX: How to do this better?
        service.find().then((items) => {
            items.data.forEach((item) => {
                service.remove(item._id);
            });

            done();
        });

        // Doesn't work.
        // service.remove(null, {});
        // done();
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
