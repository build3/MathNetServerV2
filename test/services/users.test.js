const assert = require('assert');
const app = require('../../src/app');
const log = require('../../src/logger');

describe('users service', () => {
    const service = app.service('users');

    beforeEach(async () => {
        service.options.multi = true;

        await service.remove(null);

        service.options.multi = false;
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
            permissions: ['admin']
        });

        assert.deepEqual(user.permissions, ['admin']);
    });

    it('creates a user with student permissions', async () => {
        const user = await service.create({
            username: 'franz@kafka.eu',
            password: 'testtest',
            permissions: ['student']
        });

        assert.deepEqual(user.permissions, ['student']);
    });

    it('creates a user with unexisting permissions', async () => {
        // So far there is no validation for allowed permissions.
        const user = await service.create({
            username: 'franz@kafka.eu',
            password: 'testtest',
            permissions: ['ponycorn']
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
        assert.equal((await service.find(user._id)).length, 1);

        // Remove user.
        await service.remove(user._id)

        // Check is user has been removed successfully.
        assert.equal((await service.find(user._id)).length, 0);
    });

    it('changes password', async () => {
        const user = await service.create({
            username: 'franz@kafka.eu',
            password: 'testtest',
        });

        await service.patch(user._id, { password: 'testtest2' });

        const updatedUser = await service.find(user._id);

        assert.notEqual(user.password, updatedUser[0].password)
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
