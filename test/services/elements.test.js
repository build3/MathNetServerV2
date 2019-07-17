const assert = require('assert');
const app = require('../../src/app');
const log = require('../../src/logger');
const { clearAll, makeClient } = require('../utils');

describe('Element\'s management', function () {
    const users = app.service('users');
    const elements = app.service('elements');
    const host = app.get('host');
    const port = app.get('port');

    const username = 'franz';
    const otherUsername = 'adam';
    const password = 'testtest';

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

        const { client, _ } = await makeClient({ username, password });

        service = client.service('elements');
    });

    beforeEach(async () => {
        await clearAll('elements');
    });

    it('lists elements', async () => {
        const elementData = {
            name: 'name',
            owner: username,
            workshop: 'workshops1',
            xml: '<xml />'
        };

        await elements.create(elementData);
        await elements.create(elementData);
        await elements.create(elementData);

        elementData['owner'] = 'adam'

        await elements.create(elementData);
        await elements.create(elementData);

        const result = await service.find();

        assert.equal(result.length, 5);
    });

    it('gets element of other user', async () => {
        const elementData = {
            name: 'name',
            owner: 'adam',
            workshop: 'workshops1',
            xml: '<xml />'
        };

        const element = await elements.create(elementData);

        const existingElements = await elements.find({
            query: {_id: element._id },
        });

        assert.equal(existingElements.length, 1);
        assert.deepEqual(existingElements[0]._id, element._id);
    });

    it('removes own element', async () => {
        const elementData = {
            name: 'name',
            owner: username,
            workshop: 'workshops1',
            xml: '<xml />'
        };

        const element = await elements.create(elementData);

        await service.remove(element._id);

        const existingElements = await elements.find({
            query: { _id: element._id },
        });

        assert.equal(existingElements.length, 0);
    });

    it('does not remove element of other user', async () => {
        const elementData = {
            name: 'name',
            owner: username,
            workshop: 'workshops1',
            xml: '<xml />'
        };

        const element = await elements.create(elementData);

        assert.rejects(async () => {
            await service.remove(element._id);
        });

        const existingElements = await elements.find({
            query: { _id: element._id },
        });

        assert.equal(existingElements.length, 1);
    });
});
