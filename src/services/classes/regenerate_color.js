const compression = require("compression");

function getRandomColor() {
    return [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 160),
    ];
}

async function reGenerateColor(context) {
    const users = context.app.service('users');

    const userColors = await users.find({
        query: {
            permissions: 'student'
        }
    });

    userColors.forEach(({ color: [,, blue], permissions, username }) => {
        if (blue > 160 && permissions.includes('student')) {
            users.patch(username, { color: getRandomColor() });
        };
    });
}

module.exports = { reGenerateColor };
