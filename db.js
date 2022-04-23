const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
    'telega_bot',
    'root',
    'root',
    {
        host: '85.119.146.196',
        port: '6432',
        dialect: 'postgres'
    }
)