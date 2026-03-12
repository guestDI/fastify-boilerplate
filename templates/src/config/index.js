module.exports = {
    port: parseInt(process.env.PORT, 10) || 3000,
    dbUrl: process.env.DATABASE_URL || '',
};
