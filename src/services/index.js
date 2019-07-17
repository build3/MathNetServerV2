const users = require('./users/users.service.js');
const classes = require('./classes/classes.service.js');
const elements = require('./elements/elements.service.js');
const groups = require('./groups/groups.service.js');
const views = require('./views/views.service.js');
const constructions = require('./constructions/constructions.service.js');
const workshops = require('./workshops/workshops.service.js');

module.exports = (app) => {
    // Persistent
    app.configure(users);
    app.configure(classes);
    app.configure(groups);
    app.configure(constructions);
    app.configure(elements);

    // Real-time
    app.configure(views);
    app.configure(workshops);
};
