const { BadRequest } = require('@feathersjs/errors');

async function checkIfExists(context) {
    const elements = await context.app.service('elements').find({
        query: { id: context.data.id },
    });

    if (elements.length !== 0) {
        throw new BadRequest('Element with entered id already exists');
    } else {
        return context;
    }
}