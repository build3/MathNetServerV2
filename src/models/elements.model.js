module.exports = (app) => {
    const client = app.get('mongooseClient');
    const { Schema } = client;

    const elements = new Schema({
        name: {
            type: String, required: true, unique: false,
        },
        owner: {
            type: String, required: true, unique: false,
        },
        workshop: {
            type: String, required: true, unique: false,
        },
        // XML content of single element. Imported
        // and exported by GeoGebra applet.
        xml: {
            type: String, required: true, unique: false,
        },
    }, {
        timestamps: true,
    });

    return client.model('elements', elements);
};
