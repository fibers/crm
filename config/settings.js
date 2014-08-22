var settings = {

    'development': {

        db: {
            api: {
                host: 'XXXXX',
                port: 3306,
                database: 'XXXXX',
                user: 'XXXXX',
                password: 'XXXXX',
                dialect: 'mysql'
            },

            crm: {
                host: 'XXXXX',
                port: 3306,
                database: 'XXXXX',
                user: 'XXXXX',
                password: 'XXXXX',
                dialect: 'mysql'
            }
        },

        numberPerPage: 50,

        imageUrlPrefix: "http://res.cloudinary.com/XXXXX",

        fmmc: {
            host: 'XXXXX',
            port: XXXXX
        }

    },

    'production': {

        db: {
            api: {
                host: 'XXXXX',
                port: 3306,
                database: 'XXXXX',
                user: 'XXXXX',
                password: 'XXXXX',
                dialect: 'mysql'
            },

            crm: {
                host: 'XXXXX',
                port: 3306,
                database: 'XXXXX',
                user: 'XXXXX',
                password: 'XXXXX',
                dialect: 'mysql'
            }
        },

        numberPerPage: 100,

        imageUrlPrefix: "http://res.cloudinary.com/XXXXX",

        fmmc: {
            host: 'XXXXX',
            port: XXXXX
        }
    }
};

module.exports = settings[process.env.NODE_ENV || 'development'];
