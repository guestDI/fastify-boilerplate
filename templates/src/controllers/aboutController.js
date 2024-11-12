const aboutService = require('../services/aboutService');

exports.getAbout = async (request, reply) => {
    const aboutYouApplication = await aboutService.getAbout();
    reply.send(aboutYouApplication);
};
