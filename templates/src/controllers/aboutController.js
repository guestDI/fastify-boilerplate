const aboutService = require('../services/aboutService');

exports.getUsers = async (request, reply) => {
    const aboutYouApplication = await aboutService.getAbout();
    reply.send(aboutYouApplication);
};
