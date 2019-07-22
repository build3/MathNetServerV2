/* eslint-disable no-undef */

const assert = require('assert');

const app = require('../../src/app');
const { clearAll, makeClient } = require('../utils');

const host = app.get('host');
const port = app.get('port');

const user = {
    username: 'gauss',
    password: 'secret',
    permissions: ['admin'],
    strategy: 'local',
};

describe.only('\'constructions\' service', () => {
    const users = app.service('users');
    const constructions = app.service('constructions');

    let server;
    let client;
    let service;

    before(async () => {
        server = app.listen(port);

        await clearAll('users', 'constructions');

        await users.create(user);

        ({ client, _ } = await makeClient(host, port, 'gauss', 'secret'));

        service = client.service('constructions');
    });

    after(() => {
        server.close();
    });

    describe('user', async () => {
        it('his constructions are assigned to them', async () => {
            await client.authenticate(user);

            await service.create({
                name: 'gaussian', xml: 'xml',
            });

            const owner = await users.get(user.username);

            assert(owner.constructions.includes('gaussian'));
        });

        it('assigned constructions are removed when construction is deleted', async () => {
            await client.authenticate(user);

            const construction = await service.create({
                name: 'test', xml: 'xml',
            });

            await service.remove(construction.name);

            const owner = await users.get(user.username);

            assert(!owner.constructions.includes(construction.name));
        });
    });

    describe('user', async () => {
        before(async () => {
            await users.create({
                username: 'newton',
                password: 'secret',
                permissions: ['admin'],
            });

            constructions.create({ name: 'newtonian', xml: 'xml' });
        });

        it('cannot patch someone elses construction', async () => {
            await assert.rejects(async () => {
                await service.patch('newtonian', { xml: 'xml' });
            });
        });

        it('cannot get someone elses construction', async () => {
            await assert.rejects(
                async () => { await service.get('newtonian'); },
            );
        });

        it('cannot update someone elses construction', async () => {
            await assert.rejects(
                async () => {
                    await service.update('newtonian', { xml: 'xml', name: 'gaussian' });
                },
            );
        });
    });
});
