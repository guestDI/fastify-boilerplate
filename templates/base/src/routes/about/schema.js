const userSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
    },
    required: ['name', 'email'],
};

module.exports = {
    userSchema,
};
