module.exports = (app) => {
    const client = app.get('mongooseClient');
    const { Schema } = client;

    const users = new Schema({
        username: {
            type: String, required: true, unique: true,
        },
        password: {
            type: String, required: true,
        },
        permissions: {
            type: [String], required: true,
        },
        constructions: {
            type: [String], required: true,
        },
        workshops: {
            type: [String], required: true,
        },
        color: {
            type: [Number], required: true,
        },
        numberInGroup: {
            type: Number, required: false, default: null,
        },
    }, {
        timestamps: true,
    });

    return client.model('users', users);
};
