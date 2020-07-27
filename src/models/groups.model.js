module.exports = (app) => {
    const client = app.get('mongooseClient');
    const { Schema } = client;

    const groups = new Schema({
        // teachers.username == groups.teacher
        teacher: {
            type: String, required: true,
        },
        // classes.name == groups.class
        class: {
            type: String, required: true,
        },
        name: {
            type: String, required: false,
        },
        color: {
            type: [Number], required: false,
        },
    }, {
        timestamps: true,
    });

    return client.model('groups', groups);
};
