const assert = require('assert');
const app = require('../../src/app');
const log = require('../../src/logger');
const { clearAll, makeClient } = require('../utils');

describe('Application\'s class management', function () {
    const users = app.service('users');
    const classes = app.service('classes');
    const host = app.get('host');
    const port = app.get('port');

    const username = 'franz';
    const otherUsername = 'adam';
    const password = 'testtest';

    const defaultClassJson = {
        teacher: username,
        name: 'franz\'s class',
        code: 'code',
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

        service = client.service('classes');
    });

    beforeEach(async () => {
        await clearAll('classes');
    });

    it('lists classes', async () => {
        const otherUserClassData = {
            teacher: otherUsername,
            name: 'other class name',
            code: '2a',
        };

        await classes.create(defaultClassJson);
        await classes.create(defaultClassJson);
        await classes.create(defaultClassJson);

        await classes.create(otherUserClassData);
        await classes.create(otherUserClassData);

        const result = await service.find();

        assert.equal(result.length, 3);
    });

    it('creates classes', async () => {
        const studentClass = await service.create(defaultClassJson);

        const existingClasses = await classes.find({
            query: { teacher: username },
        });

        assert.equal(existingClasses.length, 1);
        assert.equal(existingClasses[0].code, studentClass.code);
    });

    it('patches own class', async () => {
        const studentClass = await classes.create(defaultClassJson);
        const className = 'changed class';

        await service.patch(studentClass.code, {
            name: className,
        });

        const updatedClass = await classes.get(studentClass.code);

        assert.equal(updatedClass.name, className);
    });

    it('does not patch class of other user', async () => {
        const className = 'class name';
        const studentClass = await classes.create({
            teacher: otherUsername,
            name: className,
            code: '4a',
        });

        await assert.rejects(async () => {
            await service.patch(studentClass.code, { class: 'changed class name' });
        });

        const updatedClass = await classes.get(studentClass.code);

        assert.equal(studentClass.name, updatedClass.name);
    });

    it('removes own class', async () => {
        const studentClass = await classes.create(defaultClassJson);

        await service.remove(studentClass.code);

        const existingClasses = await classes.find({
            query: { teacher: username },
        });

        assert.equal(existingClasses.length, 0);
    });

    it('does not remove class of other user', async () => {
        const studentClass = await classes.create({
            teacher: otherUsername,
            name: 'class name',
            code: '4a',
        });

        await assert.rejects(async () => {
            await service.remove(studentClass.code);
        });

        const existingClasses = await classes.find({
            query: { teacher: otherUsername },
        });

        assert.equal(existingClasses.length, 1);
    });
});
