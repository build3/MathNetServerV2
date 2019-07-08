// eslint-disable-next-line no-unused-vars

const users = require('./users/users.service.js');
const classes = require('./classes/classes.service.js');
const geogebra = require('./geogebra/geogebra.service.js');

module.exports = function (app) {
  app.configure(users);
  app.configure(classes);
  app.configure(geogebra);
};
