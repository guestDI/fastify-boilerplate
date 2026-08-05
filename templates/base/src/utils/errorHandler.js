'use strict';

module.exports = (error, request, reply) => {
  const status = error.statusCode || 500;

  if (status >= 500) {
    request.log.error(error);
    return reply.status(status).send({ error: 'Internal Server Error' });
  }

  // 4xx (validation, auth, not found): the message is safe to return.
  request.log.warn(error);
  return reply.status(status).send({ error: error.message });
};
