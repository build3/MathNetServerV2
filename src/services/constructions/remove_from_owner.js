/**
 * Removes construction from owner's `constructions` property.
 */
async function removeFromOwner({ params: { user: owner }, app, result }) {
    const users = app.service('users');

    await users.patch(owner.username, {
        constructions: owner.constructions.filter(construction => construction !== result.name),
    });
}

module.exports = removeFromOwner;
