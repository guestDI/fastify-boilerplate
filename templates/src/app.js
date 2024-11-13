const app = require('fastify')({ logger: true });
const aboutRoute = require('./routes/about');

//Plugins registration
app.register(require('./plugins/db'));
app.register(require('./plugins/auth'));

//Routes registration
app.register(aboutRoute, { prefix: '/about' });

module.exports = app;
