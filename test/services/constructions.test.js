const assert = require('assert');
const app = require('../../src/app');

describe('\'constructions\' service', () => {
    it('registered the service', () => {
        const service = app.service('constructions');

        assert.ok(service, 'Registered the service');
    });
});
