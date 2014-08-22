var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var _ = Sequelize.Utils._;
var settings = require('../config/settings.js');

var allDbNames = _.keys(settings.db);

var db = {};
var sequelizes = {};

_.each(allDbNames, function (dbName) {

    var dbInfo = settings.db[dbName];
    var sequelize = new Sequelize(dbInfo.database, dbInfo.user, dbInfo.password,
        {dialect: dbInfo.dialect, port: dbInfo.port, host:dbInfo.host, pool: {
            maxIdleTime: 600000, maxConnections: 10
        }, logging: console.log});

    sequelizes[dbName] = sequelize;

    fs.readdirSync(path.join(__dirname, dbName)).filter(function (file) {
        return (file.indexOf('.') !== 0 ) && (file !== 'index.js');
    }).forEach(function (file) {
        var model = sequelize.import(path.join(__dirname, dbName, file));
        db[model.name] = model;
    });
});


Object.keys(db).forEach(function (modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

module.exports = _.assign({
    sequelizes: sequelizes,
    Sequelize: Sequelize
}, db);
