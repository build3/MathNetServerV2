function getRandomColor() {
    return [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 160),
    ];
}

async function setGroupColor(context) {
    const groups = context.app.service('groups');

    const groupsWithoutColor = await groups.find({
        query: {
            color: [],
            teacher: context.params.user.username
        }
    });

    groupsWithoutColor.forEach( element => {
        groups.patch(element._id, { color: getRandomColor() },
            { user: context.params.user });
    });
}

module.exports = { setGroupColor };
