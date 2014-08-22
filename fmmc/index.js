var FmmcApi = require('./gen-nodejs/FmmcApi.js');
var FmmcTypes = require('./gen-nodejs/fmmc_types.js');

var thrift = require('thrift');
var logger = require('../config/logger.js');

function FmmcThrift(host, port) {
    this.types = FmmcTypes;
    var connection = thrift.createConnection(host, port);
    connection.on('error', function (err) {
        logger.error(err);
    });
    this.client = thrift.createClient(FmmcApi, connection);
}


module.exports = FmmcThrift;








