module.exports = (app) => {
    const client = app.get('mongooseClient');
    const { Schema } = client;

    const constructions = new Schema({
        xml: {
            type: String, required: true,
        },
    }, {
        timestamps: true,
    });

    return client.model('constructions', constructions);
};
