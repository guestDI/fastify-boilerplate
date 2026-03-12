'use strict';

// Example user model schema
module.exports = {
    name: 'User',
    schema: {
        id: { type: 'integer', primaryKey: true },
        name: { type: 'string', allowNull: false },
        email: { type: 'string', allowNull: false, unique: true },
    },
};
