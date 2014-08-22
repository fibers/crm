function DBUtils() {

}

module.exports = DBUtils;

DBUtils.md5Encrypt = function (str) {
    var md5 = require('crypto').createHash('md5');
    md5.update(str);
    return md5.digest('hex');
};