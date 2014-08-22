var DateUtils = require('date-utils');

function Utils() {

}

module.exports = Utils;

Utils.getDateFromRange = function (range) {

    var now = Date.today();
    var DATE_FORMAT = 'YYYY-MM-DD';

    switch (range) {
        case 'month':
            return now.addMonths(-1).toFormat(DATE_FORMAT);
        case 'week':
            return now.addDays(-6).toFormat(DATE_FORMAT);
        case 'day':
            return now.toFormat(DATE_FORMAT);
        default:
            return '';
    }
};

Utils.getTextFromRange = function (range) {
    switch (range) {
        case 'month':
            return "Month";
        case 'week':
            return "Week";
        case 'day':
            return "Day";
        default:
            return "";
    }
};


