module.exports = (app) => {
    const client = app.get('mongooseClient');
    const { Schema } = client;

    const classes = new Schema({
        name: {
            type: String, required: true,
        },
        // classes.teacher == users.username
        teacher: {
            type: String, required: true,
        },
        code: {
            type: String, required: true, unique: true,
        },
    }, {
        timestamps: true,
    });

    return client.model('classes', classes);
};
