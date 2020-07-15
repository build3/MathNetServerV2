const { BadRequest } = require('@feathersjs/errors');
const checkPermissions = require('feathers-permissions');
const { preventChanges } = require('feathers-hooks-common');
const { Verifier } = require('@feathersjs/authentication-local');

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

async function checkOldPassword(context) {
    const oldPassword = context.data.oldPassword;
    const user = context.params.user;

    if (context.data.hasOwnProperty('password')) {
        if (!context.data.hasOwnProperty('oldPassword') || oldPassword === '') {
            throw new BadRequest('Old password is required.');
        } else {
            try {
                const verifier = new Verifier(context.app, { service: 'users', passwordField: 'password' });
                await verifier._comparePassword(user, oldPassword);
            } catch (e) {
                throw new BadRequest('Old password is wrong');
            }
        }
    }

    return context;
}

function getRandomColor() {
    return [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 160),
    ];
}

function generateColor(context) {
    if (!context.data.hasOwnProperty('color')) {
        context.data.color = getRandomColor();
    }

    return context;
}

function checkUsername(context) {
    if (context.data.hasOwnProperty('username')) {
        if (context.data.username.includes('_')) {
            throw new BadRequest('Username cannot contain _');
        }
    }

    return context;
}

module.exports = {
    checkAdminOrOwner,
    checkOldPassword,
    checkOwner,
    checkUsername,
    generateColor,
    preventChangesIfNotOwner,
};
