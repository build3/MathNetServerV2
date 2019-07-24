const { BadRequest } = require('@feathersjs/errors');
const checkPermissions = require('feathers-permissions');
const { preventChanges } = require('feathers-hooks-common');
const bcrypt = require('bcryptjs');


function isOwner({ params: { user }, arguments: [userId, ...other] }) {
    // If user is equal to undefined then internal call is perform.
    return user === undefined || user.username === userId;
}

/**
 * Checks whether requested user is admin or owns resource.
 */
function checkAdminOrOwner() {
    return checkPermissions({
        // Returns allowed roles for request.
        roles(context) {

            if (isOwner(context)) {
                return ['admin', 'student'];
            }

            return ['admin'];
        },
    });
}

/**
 * Checks whether requested user owns resource.
 */
function checkOwner() {
    return function (context) {
        if (isOwner(context)) {
            return context;
        }

        return undefined;
    };
}

/**
 * Prevents to update `field` of resource, unless requested user is
 * an owner of the resource.
 */
function preventChangesIfNotOwner(field) {
    return function (context) {
        if (isOwner(context)) {
            return context;
        }

        return preventChanges(true, field);
    };
}

const comparePasswords = (oldPassword, password) => new Promise((resolve, reject) => {
    bcrypt.compare(oldPassword, password, (bcryptError, result) => {
        if (bcryptError || !result) {
            return reject();
        } else {
            return resolve();
        }
    });
});

async function checkOldPassword(context) {
    const oldPassword = context.data.oldPassword;
    const currentPassword = context.params.user.password;

    if (context.data.hasOwnProperty('password')) {
        if (!context.data.hasOwnProperty('oldPassword') || oldPassword === '') {
            throw new BadRequest('Old password is required.');
        } else {
            try {
                await comparePasswords(oldPassword, currentPassword);
            } catch (e) {
                throw new BadRequest('Old password is wrong');
            }
        }
    }

    return context;
}

module.exports = {
    checkAdminOrOwner,
    checkOldPassword,
    checkOwner,
    preventChangesIfNotOwner,
};
