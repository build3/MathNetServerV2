/**
 * Assigns new construction to owner.
 */
async function assignToOwner({ params: { user: owner }, app, data }) {
    const users = app.service('users');

    await users.patch(owner.username, {
        constructions: [...owner.constructions, data.name],
    });
}

module.exports = assignToOwner;
