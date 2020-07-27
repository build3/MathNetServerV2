const mongoose = require('mongoose');

module.exports = (app) => {
    const client = app.get('mongooseClient');
    const { Schema } = client;

    const constructions = new Schema({
        name: {
            type: String, required: true, unique: true,
        },
        // XML content of the construction. Imported
        // and exported by GeoGebra applet.
        xml: {
            type: String, required: true,
        },
        properties: {
            type: mongoose.Schema.Types.Mixed, required: false, default: null,
        },
    }, {
        timestamps: true,
    });

    return client.model('constructions', constructions);
};
