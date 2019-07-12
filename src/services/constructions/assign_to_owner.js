/**
 * Ensure that only owners of constructions
 * have access to them.
 */
async function assignToOwner({ params: { user: owner }, app: { service } }) {
    const users = service('users');

    await users.patch(owner.username, {
        constructions: [...owner.constructions, context.data.name],
    });
}

module.exports = assignToOwner;
