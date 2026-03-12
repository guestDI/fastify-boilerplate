'use strict';

const { generateRoute } = require('../generators/route');

function registerRouteCommand(program) {
  program
    .command('route <routeName>')
    .description('Generate controller, route, model, and service for a new route')
    .action(async (routeName) => {
      try {
        await generateRoute(routeName);
        console.log(`Generated files for route: ${routeName}`);
      } catch (error) {
        console.error('Error generating route files:', error);
      }
    });
}

module.exports = { registerRouteCommand };
