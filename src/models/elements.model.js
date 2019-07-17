module.exports = (app) => {
    const client = app.get('mongooseClient');
    const { Schema } = client;

    const elements = new Schema({
        name: {
            type: String, required: true,
        },
        // owner === user.username
        owner: {
            type: String, required: true,
        },
        workshops: {
            type: String, required: true,
        },
        // XML content of single element. Imported
        // and exported by GeoGebra applet.
        xml: {
            type: String, required: true,
        },
    }, {
        timestamps: true,
    });

    return client.model('elements', elements);
};
