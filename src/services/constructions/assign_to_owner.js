/**
 * Ensure that only owners of constructions
 * have access to them.
 */
async function assignToOwner({ params: { user: owner }, app, data }) {
    const users = app.service('users');

    await users.patch(owner.username, {
        constructions: [...owner.constructions, data.name],
    });
}

module.exports = assignToOwner;
