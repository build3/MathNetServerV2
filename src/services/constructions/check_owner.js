const log = require('../../logger');

/**
 * Ensure that only owners of constructions
 * have access to them.
 */
async function checkOwner(context) {
    const caller = context.params.user;

    // Find owner of the construction to compare it with the caller.
    const owner = await context.app.service('users').find({
        query: {
            constructions: context.id,
        },
    });

    if (Array.isArray(owner) && owner.length > 0) {
        if (owner.length > 1) {
            const message = (
                `Inconsistent database state, construction ${context.id}
                has more than one owner.`
            );

            log.error(message);
            throw new Error(message);
        } else if (owner[0].username !== caller.username) {
            throw new Error('Construction does not belong to the caller');
        }
    } else {
        const message = (
            `Inconsistent database state, construction ${context.id}
            has no owners. ${JSON.stringify(owner)}`
        );

        log.error(message);
        throw new Error(message);
    }
}

module.exports = checkOwner;
