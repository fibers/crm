var log4jsSettings = {

    'development': {

        appenders: [
            {
                type: 'console',
                category: "default"
            }
        ],
        replaceConsole: false,
        levels: {
            default: 'DEBUG'
        }
    },

    'production': {

        appenders: [
            {
                type: "dateFile",
                absolute: false,
                filename: 'logs/access.log',
                pattern: "_yyyy-MM-dd",
                alwaysIncludePattern: true,
                backups: 15,
                category: 'default'
            }
        ],
        replaceConsole: true,
        levels: {
            default: 'WARN'
        }
    }
};

var log4js = require('log4js');
log4js.configure(log4jsSettings[process.env.NODE_ENV || 'development']);

var logger = log4js.getLogger('default');

module.exports = logger;