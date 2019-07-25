const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const swagger = require('feathers-swagger');
const logger = require('./logger');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

const authentication = require('./authentication');

const mongoose = require('./mongoose');

const app = express(feathers());

// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio((io) => {
    io.on('connection', (socket) => {
        socket.on('ping-rate', () => {
            socket.emit('pong-rate');
        });
    });
}));

// Swagger documentation configuration. Services should be registered after this.
app.configure(swagger({
    specs: {
        info: {
            title: 'Docs',
            description: 'Docs',
        },
        components: {
            schemas: {
                authentication: {
                    properties: {
                        required: ['username', 'strategy', 'password'],
                        strategy: {
                            type: 'string',
                            example: 'local',
                            writeOnly: true,
                        },
                        username: {
                            type: 'string',
                            writeOnly: true,
                        },
                        password: {
                            type: 'string',
                            writeOnly: true,
                        },
                        accessToken: {
                            type: 'string',
                            readOnly: true,
                        }
                    },
                },
            },
        },
    },
    openApiVersion: 3,
    docsPath: '/docs',
    uiIndex: true,
}));

app.configure(mongoose);

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
app.configure(authentication);
// Set up our services (see `services/index.js`)

app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

module.exports = app;
