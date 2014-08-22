var settings = require('../config/settings.js');
var Pagination = require('../utils/pagination.js');
var DBUtils = require('../utils/db_utils.js');
var Utils = require('../utils/utils.js');
var Async = require('async');

var logger = require('../config/logger.js');

var db = require('../models');
var _ = db.Sequelize.Utils._;

var FmmcThrift = require('../fmmc');
var fmmc = new FmmcThrift(settings.fmmc.host, settings.fmmc.port);


module.exports = function (app) {
    // **************** Login logic start **************************//
    if ('development' == app.get('env')) {
        // Test page
        app.get('/test', function (req, res) {
            res.locals.title = 'test page';
            console.log(db.User);
            res.render('test');
        });
    }

    app.get('/', function (req, res) {
        res.redirect('/login');
    });

    app.get('/login', checkNotLogin, function (req, res) {
        res.render('login', {"layout": false});
    });

    app.post('/login', checkNotLogin, function (req, res) {

        var username = req.body.username;
        var password = DBUtils.md5Encrypt(req.body.password);

        Async.parallel(
            {
                language: function (cb) {

                    db.Language.find({
                        iso_code: 'en',
                        status: 1
                    }).complete(cb);
                },
                availableLanguages: function (cb) {
                    db.Language.findAll({
                        where: {
                            status: 1
                        }
                    }).complete(cb);
                },
                admin: function (cb) {

                    db.Admin.find({
                        where: {
                            username: username,
                            password: password
                        }
                    }).complete(cb);
                }

            }, function (err, results) {

                if (err) {
                    logger.error(err);

                    req.flash('error', 'Failed to login.');
                    return res.redirect('/login');
                }

                var language = results.language;
                var admin = results.admin;
                var availableLanguages = results.availableLanguages;

                if (!admin) {

                    logger.warn('Attempt to login with an unauthorized username "' +
                        username + '" from ' + req.ip);

                    req.flash('error', 'Wrong username or password.');
                    return res.redirect('/login');
                }

                logger.info('"' + username + '" was login.');

                req.session.currentAdmin = admin;
                req.session.language = language;
                req.session.availableLanguages = availableLanguages;

                req.flash('success', 'Login Successfully.');
                res.redirect('/index');
            }
        );
    });

    app.get('/logout', checkLogin, function (req, res) {

        var currentAdmin = req.session.currentAdmin;

        logger.info('"' + currentAdmin.username + '" was logout.');

        req.session.language = null;
        req.session.currentAdmin = null;

        req.flash('success', 'Logout Successfully');
        res.redirect('/login');
    });

// **************** Login logic End **************************//

// **************** Tags list logic start **************************//

    app.get('/tags/enable/:id', checkLogin, function (req, res) {

        var id = req.params.id;
        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/tags';

        Async.waterfall([
                function (cb) {
                    db.Tag.find(id).success(function (tag) {
                        if (tag) {
                            cb(null, tag);
                        } else {
                            cb('The tag does not exists.', null);
                        }
                    }).error(function (err) {
                        cb(err, null);
                    });
                },
                function (tag, cb) {
                    tag.updateAttributes({
                        status: 1
                    }, ['status']).complete(cb);
                }
            ],
            function (err, tag) {

                if (err) {
                    logger.error(err);
                    req.flash('error', 'Failed to enable the tag.');
                } else {
                    if (tag) {
                        req.flash('success', 'Enable the tag successfully.');
                    } else {
                        req.flash('error', 'Failed to enable the tag.');
                    }
                }
                res.redirect(redirectUrl);
            }
        );
    });

    app.get('/tags/disable/:id', checkLogin, function (req, res) {

        var id = req.params.id;
        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/tags';

        Async.waterfall([
                function (cb) {
                    db.Tag.find(id).success(function (tag) {
                        if (tag) {
                            cb(null, tag);
                        } else {
                            cb('The tag does not exists.', null);
                        }
                    }).error(function (err) {
                        cb(err, null);
                    });
                },
                function (tag, cb) {
                    tag.updateAttributes({
                        status: 0
                    }, ['status']).complete(cb);
                }
            ],
            function (err, tag) {

                if (err) {
                    logger.error(err);
                    req.flash('error', 'Failed to disable the tag.');
                } else {
                    if (tag) {
                        req.flash('success', 'Disable the tag successfully.');
                    } else {
                        req.flash('error', 'Failed to disable the tag.');
                    }
                }
                res.redirect(redirectUrl);
            }
        );
    });

    app.post('/tags/create', checkLogin, function (req, res) {

        db.Tag.create(req.body, ['title', 'status'])
            .complete(function (err, tag) {
                if (err) {
                    logger.error(err);
                    req.flash('error', 'Failed to create the new tag.');
                } else {
                    if (tag) {
                        req.flash('success', 'Create new tag successfully.');
                    } else {
                        req.flash('error', 'Failed to create the new tag.');
                    }
                }
                res.redirect('/tags');
            });
    });

    app.get('/tags/create', checkLogin, function (req, res) {

        res.render('create_tag', {
            title: 'Create New Tag'
        });
    });

    app.get('/tags', checkLogin, function (req, res) {

        db.Tag.findAll().complete(function (err, tags) {
            if (err) {
                logger.error(err);

                req.flash('error', 'Failed to load the tags.');
                return res.redirect('/error');
            }

            res.render('tags', {
                title: 'Tag List',
                tags: tags
            });
        });
    });


// **************** Tags logic End **************************//

// **************** Complaint list logic start **************************//

    app.get('/reports/user/process/:id', checkLogin, function(req,res){

        var id = req.params.id;
        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/reports/user';

        Async.waterfall([
                function (cb) {
                    db.UserReport.find(id).success(function (userReport) {
                        if (userReport) {
                            cb(null, userReport);
                        } else {
                            cb('The user report does not exists.', null);
                        }
                    }).error(function (err) {
                        cb(err, null);
                    });
                },
                function (userReport, cb) {
                    userReport.updateAttributes({
                        is_processed: 1
                    }, ['is_processed']).complete(cb);
                }
            ],
            function (err, userReport) {

                if (err) {
                    logger.error(err);
                    req.flash('error', 'Failed to process the user report.');
                } else {
                    if (userReport) {
                        req.flash('success', 'Disable the user report successfully.');
                    } else {
                        req.flash('error', 'Failed to disable the user report.');
                    }
                }
                res.redirect(redirectUrl);
            }
        );
    });

    app.get('/reports/commodity/process/:id', checkLogin, function(req,res){

        var id = req.params.id;
        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/reports/commodity';

        Async.waterfall([
                function (cb) {
                    db.CommodityReport.find(id).success(function (commodityReport) {
                        if (commodityReport) {
                            cb(null, commodityReport);
                        } else {
                            cb('The commodity report does not exists.', null);
                        }
                    }).error(function (err) {
                        cb(err, null);
                    });
                },
                function (commodityReport, cb) {
                    commodityReport.updateAttributes({
                        is_processed: 1
                    }, ['is_processed']).complete(cb);
                }
            ],
            function (err, commodityReport) {

                if (err) {
                    logger.error(err);
                    req.flash('error', 'Failed to process the commodity report.');
                } else {
                    if (commodityReport) {
                        req.flash('success', 'Disable the commodity report successfully.');
                    } else {
                        req.flash('error', 'Failed to disable the commodity report.');
                    }
                }
                res.redirect(redirectUrl);
            }
        );
    });

    app.get('/reports/commodity', checkLogin, function (req, res) {
        db.CommodityReport.findAll().complete(function (err, commodityReports) {
            if (err) {
                logger.error(err);

                req.flash('error', 'Failed to load the commodity reports.');
                return res.redirect('/error');
            }

            res.render('reports_commodity', {
                title: 'Commodity Report List',
                commodityReports: commodityReports
            });
        });
    });

    app.get('/reports/user', checkLogin, function (req, res) {
        db.UserReport.findAll().complete(function (err, userReports) {
            if (err) {
                logger.error(err);

                req.flash('error', 'Failed to load the commodity reports.');
                return res.redirect('/error');
            }

            res.render('reports_user', {
                title: 'User Report List',
                userReports: userReports
            });
        });
    });

// **************** Complaint list end start **************************//

// **************** User list logic start **************************//

    app.get('/users', checkLogin, function (req, res) {

        if (!req.query.search) {
            res.redirect('/users/0');

        } else {

            var searchWord = req.query.search;
            var pagination = new Pagination(0, 1);

            db.User.findAll({
                where: {
                    username: {
                        like: '%' + searchWord + '%'
                    }
                }
            }).success(function (users) {

                res.render('users', {
                    pagination: pagination,
                    users: users,
                    title: 'Search Results',
                    searchWord: searchWord
                });

            }).error(function (err) {

                logger.error(err);

                req.flash('error', 'Failed to load the search results');
                return res.redirect('/users/0');
            });
        }
    });


    app.get('/users/:page', checkLogin, function (req, res) {

        var currentPage = req.params.page;

        var offset = currentPage * settings.numberPerPage;
        var limit = settings.numberPerPage;

        db.User.findAndCountAll({
            offset: offset,
            limit: limit,
            order: [
                ['id', 'ASC']
            ]
        }).complete(function (err, results) {
            if (err) {
                logger.error(err);

                req.flash('error', 'Failed to load the users');
                return res.redirect('/error');
            }

            var sum = results.count;
            var users = results.rows;

            var totalPages = (sum + settings.numberPerPage - 1) / settings.numberPerPage;

            var pagination = new Pagination(currentPage, totalPages);

            res.render('users', {
                pagination: pagination,
                users: users,
                title: 'User List',
                searchWord: ''
            });
        });
    });

    app.get('/users/activate/:id', checkLogin, function (req, res) {

        var id = req.params.id;
        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/users/0';

        Async.waterfall([
                function (cb) {

                    db.User.find(id).success(function (user) {

                        if (user) {
                            cb(null, user);
                        } else {
                            cb('The user does not exist.', null);
                        }

                    }).error(function (err) {
                        cb(err, null);
                    });
                },
                function (user, cb) {
                    user.updateAttributes({
                        is_active: 1
                    }, ['is_active']).complete(cb);
                }],
            function (err, user) {

                if (err) {
                    logger.error(err);

                    req.flash('error', 'Failed to activate the user.');
                } else {
                    if (user) {
                        req.flash('success', 'Activate the user successfully.');
                    } else {
                        req.flash('error', 'Failed to activate the user.');
                    }
                }
                res.redirect(redirectUrl);
            }
        );
    });

    app.get('/users/deactivate/:id', checkLogin, function (req, res) {

        var id = req.params.id;
        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/users/0';

        Async.waterfall([
                function (cb) {

                    db.User.find(id).success(function (user) {

                        if (user) {
                            cb(null, user);
                        } else {
                            cb('The user does not exist.', null);
                        }

                    }).error(function (err) {
                        cb(err, null);
                    });
                },
                function (user, cb) {
                    user.updateAttributes({
                        is_active: 0
                    }, ['is_active']).complete(cb);
                }],
            function (err, user) {

                if (err) {
                    logger.error(err);

                    req.flash('error', 'Failed to activate the user.');
                } else {
                    if (user) {
                        req.flash('success', 'Activate the user successfully.');
                    } else {
                        req.flash('error', 'Failed to activate the user.');
                    }
                }
                res.redirect(redirectUrl);
            }
        );
    });

    app.get('/users/detail/:id', checkLogin, function (req, res) {

        var id = req.params.id;
        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/users/0';

        db.User.find(id).success(function (user) {

            if (!user) {
                logger.warn('View the user information with a nonexistent user id :  ' + id);

                req.flash('error', "The user does not exist.");
                return res.redirect(redirectUrl);
            }

            res.render('user', {
                title: 'User Information',
                user: user
            });

        }).error(function (err) {
            logger.error(err);

            req.flash('error', 'Failed to load the user information.');
            res.redirect(redirectUrl);
        });
    });

// **************** User list logic end **************************//

// **************** Image grid logic start **************************//

    app.post('/images/forbid', checkLogin, function (req, res) {

        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/images/month/0';

        var data = req.body;

        var illegalImageIds = data.illegalImageIds;
        var legalImageIds = data.legalImageIds;

        Async.auto(
            {
                illegalImages: function (cb) {

                    db.Image.findAll({
                        where: {
                            id: illegalImageIds
                        },
                        include: [
                            {model: db.Commodity, as: 'Commodity', include: [
                                {model: db.User, as: 'User'}
                            ]}
                        ]
                    }).complete(cb);

                },
                legalImages: function (cb) {

                    db.Image.findAll({
                        where: {
                            id: legalImageIds
                        },
                        include: [
                            {model: db.Commodity, as: 'Commodity'}
                        ]
                    }).complete(cb);

                },
                illegalCommodities: ['illegalImages', function (cb, results) {
                    var illegalImages = results.illegalImages;

                    Async.each(illegalImages, function (illegalImage, cb1) {

                        var commodity = illegalImage.commodity;

                        Async.series([
                            function (cb2) {
                                commodity.updateAttributes({
                                    status: 6,
                                    internal_status: 1,
                                    update_time: new Date()
                                }, ['status', 'internal_status', 'update_time']).complete(cb2);
                            },
                            function (cb2) {
                                var message = new fmmc.types.MessageDto({
                                    receiverId: commodity.user.id,
                                    template: 'ITEM_DELISTED',
                                    placeholders: {
                                        item_title: commodity.title
                                    }
                                });
                                fmmc.client.sendMessage(message, cb2);
                            }
                        ], function (err) {
                            cb1(err);
                        });

                    }, function (err) {
                        cb(err);
                    });
                }],
                legalCommodities: ['legalImages', function (cb, results) {
                    var legalImages = results.legalImages;

                    Async.each(legalImages, function (legalImage, cb1) {

                        var commodity = legalImage.commodity;
                        commodity.updateAttributes({
                            internal_status: 1,
                            update_time: new Date()
                        }, ['internal_status', 'update_time']).complete(cb1);

                    }, function (err) {
                        cb(err);
                    });
                }]
            },
            function (err, results) {

                var jsonResponse = {
                    success: true,
                    data: redirectUrl
                };

                if (err) {
                    jsonResponse.success = false;
                    jsonResponse.data = err;
                }

                res.send(jsonResponse);
            }
        );
    });

    app.get('/images/:range/:page', checkLogin, function (req, res) {


        var range = req.params.range;
        var currentPage = req.params.page;

        var dateRange = Utils.getDateFromRange(range);
        if (!dateRange) {
            logger.warn('Unsupported time range : ' + range);

            req.flash('error', 'Unsupported time range : ' + range);
            return res.redirect('/images/week/0');
        }

        var rangeText = Utils.getTextFromRange(range);

        var offset = currentPage * settings.numberPerPage;
        var limit = settings.numberPerPage;

        db.Commodity.findAll({
            where: {
                internal_status: 0,
                update_time: {
                    gte: dateRange
                }
            },
            offset: offset,
            limit: limit,
            order: [
                ['id', 'ASC']
            ],
            include: [
                {model: db.Image, as: 'Images'}
            ]
        }).complete(function (err, commodities) {
            if (err) {
                logger.error(err);

                req.flash('error', 'Failed to load the image page with the page number : ' + currentPage);
                return res.redirect('/error');
            }


            var images = _.chain(commodities).pluck('images').flatten().value();

            var totalPages = (images.length + settings.numberPerPage - 1) / settings.numberPerPage;

            var pagination = new Pagination(currentPage, totalPages);

            res.render('images', {
                pagination: pagination,
                images: images,
                title: 'Image Grid',
                rangeText: rangeText,
                range: range,
                imageUrlPrefix: settings.imageUrlPrefix
            });
        });
    });


// **************** Image grid logic end **************************//

// **************** Commodity list logic start **************************//

    app.get('/commodities/forbid/:id', checkLogin, function (req, res) {

        var id = req.params.id;
        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/commodities/month/0';

        Async.waterfall([
                function (cb) {

                    db.Commodity.find({
                        where: {
                            id: id
                        },
                        include: [
                            {model: db.User, as: 'User'}
                        ]
                    }).success(function (commodity) {

                        if (commodity) {
                            cb(null, commodity);
                        } else {
                            cb('The commodity does not exist.', null);
                        }

                    }).error(function (err) {
                        cb(err, null);
                    });
                },
                function (commodity, cb) {
                    commodity.updateAttributes({
                        status: 6,
                        update_time: new Date()
                    }, ['status', 'update_time']).complete(cb);
                }],
            function (err, commodity) {

                if (err) {
                    logger.error(err);

                    req.flash('error', 'Failed to forbid the commodity.');
                } else {
                    if (commodity) {
                        req.flash('success', 'Forbid the commodity successfully.');
                        var message = new fmmc.types.MessageDto({
                            receiverId: commodity.user.id,
                            template: 'ITEM_DELISTED',
                            placeholders: {
                                item_title: commodity.title
                            }
                        });

                        fmmc.client.sendMessage(message, function (err) {
                            if (err) {
                                logger.error(err);
                            }
                        });
                    } else {
                        req.flash('error', 'Failed to forbidden the commodity.');
                    }
                }
                res.redirect(redirectUrl);
            }
        );
    });


    app.get('/commodities/detail/:id', checkLogin, function (req, res) {

        var id = req.params.id;
        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/commodities/month/0';

        db.Commodity.find(id).success(function (commodity) {

            if (!commodity) {
                logger.warn('View the commodity information with a nonexistent id :  ' + id);

                req.flash('error', "The commodity does not exist.");
                return res.redirect(redirectUrl);
            }

            res.render('commodity', {
                title: 'Commodity Information',
                commodity: commodity
            });

        }).error(function (err) {
            logger.error(err);

            req.flash('error', 'Failed to load the commodity information.');
            res.redirect(redirectUrl);
        });
    });

    app.get('/commodities/images/:productId', checkLogin, function (req, res) {

        var productId = req.params.productId;

        db.Commodity.find({
            where: {
                id: productId
            },
            include: [
                {model: db.Image, as: 'Images'}
            ]
        }).complete(function (err, commodity) {

            var jsonResponse = {
                success: true,
                data: ''
            };

            if (err) {
                jsonResponse.success = false;
                jsonResponse.data = err;

                return res.send(jsonResponse);
            }

            if (!commodity) {
                logger.warn('Cannot find the commodity : ' + id);
                jsonResponse.success = false;
                jsonResponse.data = 'Cannot find the commodity.';

            } else if (commodity.internal_status) {
                logger.warn('The commodity has been censored : ' + id);
                jsonResponse.succes = false;
                jsonResponse.data = 'The commodity has been censored.';
            } else {
                var images = _.chain(commodity.images).pluck('image_file').map(function (imageUrl) {
                    return settings.imageUrlPrefix + imageUrl;
                }).value();

                jsonResponse.success = true;
                jsonResponse.data = images;
            }

            res.send(jsonResponse);
        });
    });


    app.get('/commodities/map/:range', checkLogin, function (req, res) {

        var range = req.params.range;

        var dateRange = Utils.getDateFromRange(range);
        if (!dateRange) {
            logger.warn('Unsupported time range : ' + range);

            req.flash('error', 'Unsupported time range : ' + range);
            return res.redirect('/commodities/map/week');
        }

        db.Commodity.findAll({
            where: {
                status: 2,
                update_time: {
                    gte: dateRange
                }
            }
        }).complete(function (err, commodities) {
            if (err) {
                logger.error(err);

                req.flash('error', 'Failed to load the map view for commodities');
                return res.redirect('/error');
            }

            return res.render('commodities_map', {

                layout: false,
                commodities: JSON.stringify(commodities)
            });
        });
    });

    app.get('/commodities/:range/:page', checkLogin, function (req, res) {

        var currentPage = req.params.page;
        var range = req.params.range;

        var dateRange = Utils.getDateFromRange(range);
        if (!dateRange) {
            logger.warn('Unsupported time range : ' + range);

            req.flash('error', 'Unsupported time range : ' + range);
            return res.redirect('/commodities/week/0');
        }

        var rangeText = Utils.getTextFromRange(range);

        var offset = currentPage * settings.numberPerPage;
        var limit = settings.numberPerPage;

        db.Commodity.findAndCountAll({
            where: {
                update_time: {
                    gte: dateRange
                }
            },
            offset: offset,
            limit: limit,
            order: [
                ['id', 'ASC']
            ]
        }).complete(function (err, results) {
            if (err) {
                logger.error(err);

                req.flash('error', 'Failed to load the commodities.');
                return res.redirect('/error');
            }

            var sum = results.count;
            var commodities = results.rows;

            var totalPages = parseInt((sum + settings.numberPerPage - 1) / settings.numberPerPage);

            var pagination = new Pagination(currentPage, totalPages);

            res.render('commodities', {
                pagination: pagination,
                commodities: commodities,
                title: 'Commodity List',
                searchWord: '',
                rangeText: rangeText,
                range: range
            });
        });
    });

    app.get('/commodities/:range', checkLogin, function (req, res) {

        var range = req.params.range;

        var dateRange = Utils.getDateFromRange(range);
        if (!dateRange) {
            logger.warn('Unsupported time range : ' + range);

            req.flash('error', 'Unsupported time range : ' + range);
            return res.redirect('/commodities/week/0');
        }

        var rangeText = Utils.getTextFromRange(range);
        var redirectUrl = '/commodities/' + range + '/0';

        if (!req.query.search) {
            res.redirect(redirectUrl);

        } else {

            var searchWord = req.query.search;

            db.Commodity.findAll({
                where: {
                    update_time: {
                        gte: dateRange
                    },
                    title: {
                        like: '%' + searchWord + '%'
                    }
                }
            }).complete(function (err, commodities) {
                if (err) {
                    logger.error(err);

                    req.flash('error', 'Failed to load the search results.');
                    return res.redirect('/error');
                }

                var pagination = new Pagination(0, 1);

                res.render('commodities', {
                    pagination: pagination,
                    commodities: commodities,
                    title: 'Search Results',
                    searchWord: searchWord,
                    rangeText: rangeText,
                    range: range
                });

            });
        }
    });


// **************** Commodity list logic end **************************//


// **************** Admin list logic start **************************//

    app.get('/admins', checkLogin, function (req, res) {

        var redirectUrl = '/admins/0';

        if (!req.query.search) {
            res.redirect(redirectUrl);

        } else {

            var searchWord = req.query.search;
            db.Admin.findAll({
                where: {
                    username: {
                        like: '%' + searchWord + '%'
                    }
                }
            }).complete(function (err, admins) {
                if (err) {
                    logger.error(err);

                    req.flash('error', 'Failed to load the search results.');
                    return res.redirect('/error');
                }

                var pagination = new Pagination(0, 1);

                res.render('admins', {
                    pagination: pagination,
                    admins: admins,
                    title: 'Search Results',
                    searchWord: searchWord
                });

            });
        }
    });

    app.get('/admins/create', checkLogin, checkSuperAdmin, function (req, res) {
        res.render('create_admin', {
            title: 'Create New Administrator'
        });
    });

    app.post('/admins/create', checkLogin, checkSuperAdmin, function (req, res) {

        var redirectUrl = '/admins/0';

        var username = req.body.username;
        var password = DBUtils.md5Encrypt(req.body.password);

        db.Admin.create({username: username, password: password, is_super_admin: false},
            ['username', 'password', 'is_super_admin'])
            .complete(function (err, admin) {
                if (err) {
                    logger.error(err);

                    req.flash('error', 'Failed to create the adminastrator.');
                } else {
                    if (admin) {
                        req.flash('success', 'Create new administrator successfully.');
                    } else {
                        req.flash('error', 'Failed to create the new administrator.');
                    }
                }

                res.redirect(redirectUrl);
            }
        );
    });


    app.get('/admins/:page', checkLogin, function (req, res) {

        var currentPage = req.params.page;
        var offset = currentPage * settings.numberPerPage;
        var limit = settings.numberPerPage;

        db.Admin.findAndCountAll({
            offset: offset,
            limit: limit,
            order: [
                ['id', 'ASC']
            ]
        }).complete(function (err, results) {
            if (err) {
                logger.error(err);

                req.flash('error', 'Failed to load the administrators.');
                return res.redirect('/error');
            }

            var sum = results.count;
            var admins = results.rows;

            var totalPages = parseInt((sum + settings.numberPerPage - 1) / settings.numberPerPage);
            var pagination = new Pagination(currentPage, totalPages);

            res.render('admins', {
                pagination: pagination,
                admins: admins,
                title: 'Administrator List',
                searchWord: ''
            });
        });
    });

    app.get('/admins/delete/:id', checkLogin, checkSuperAdmin, function (req, res) {

        var id = req.params.id;
        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/admins/0';

        if (req.session.currentAdmin.id == id) {
            logger.warn('Administrator "' + req.session.currentAdmin.username + '" try to delete hisself');

            req.flash('error', "You cannot delete yourself.");
            return res.redirect(redirectUrl);
        }

        Async.waterfall([
                function (cb) {
                    db.Admin.find(id).success(function (admin) {
                        if (admin) {
                            cb(null, admin);
                        } else {
                            cb('The administrator does not exist.', null);
                        }
                    }).error(function (err) {
                        cb(err, null);
                    });
                },
                function (admin, cb) {
                    admin.destroy().success(function () {
                        cb(null, 1);
                    }).error(function () {
                        cb(null, 0);
                    });

                }
            ],
            function (err, affectedRows) {

                if (err) {
                    logger.error(err);

                    req.flash('error', 'Failed to delete the administrator.');
                } else {
                    if (affectedRows) {
                        req.flash('success', 'Delete the administrator successfully.');
                    } else {
                        req.flash('error', 'Failed to delete the administrator.');
                    }
                }
                res.redirect(redirectUrl);
            }
        );
    });

    app.get('/admins/promote/:id', checkLogin, checkSuperAdmin, function (req, res) {

        var id = req.params.id;
        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/admins/0';

        Async.waterfall([
                function (cb) {
                    db.Admin.find(id).success(function (admin) {
                        if (admin) {
                            cb(null, admin);
                        } else {
                            cb('The administrator does not exist.', null);
                        }
                    }).error(function (err) {
                        cb(err, null);
                    });
                },
                function (admin, cb) {
                    admin.updateAttributes({
                        is_super_admin: 1
                    }, ['is_super_admin']).complete(cb);
                }
            ],
            function (err, admin) {

                if (err) {
                    logger.error(err);
                    req.flash('error', 'Failed to promote the administrator.');
                } else {
                    if (admin) {
                        req.flash('success', 'Promote the administrator successfully.');
                    } else {
                        req.flash('error', 'Failed to promote the administrator.');
                    }
                }
                res.redirect(redirectUrl);
            }
        );
    });

    app.get('/admins/demote/:id', checkLogin, checkSuperAdmin, function (req, res) {

        var id = req.params.id;
        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/admins/0';

        Async.waterfall([
                function (cb) {
                    db.Admin.find(id).success(function (admin) {
                        if (admin) {
                            cb(null, admin);
                        } else {
                            cb('The administrator does not exist.', null);
                        }
                    }).error(function (err) {
                        cb(err, null);
                    });
                },
                function (admin, cb) {
                    admin.updateAttributes({
                        is_super_admin: 0
                    }, ['is_super_admin']).complete(cb);
                }
            ],
            function (err, admin) {

                if (err) {
                    logger.error(err);
                    req.flash('error', 'Failed to demote the administrator.');
                } else {
                    if (admin) {
                        req.flash('success', 'Demote the administrator successfully.');
                    } else {
                        req.flash('error', 'Failed to demote the administrator.');
                    }
                }
                res.redirect(redirectUrl);
            }
        );
    });

    app.get('/admin/password/:id', checkLogin, checkAdminPermission, function (req, res) {
        res.render('password', {
            title: 'Change password'
        });
    });

    app.post('/admin/password/:id', checkLogin, checkAdminPermission, function (req, res) {

        var id = req.params.id;

        var oldPassword = DBUtils.md5Encrypt(req.body.oldPassword);
        var newPassword1 = DBUtils.md5Encrypt(req.body.newPassword1);
        var newPassword2 = DBUtils.md5Encrypt(req.body.newPassword2);

        var redirectUrl = '/admin/password/' + id;

        if (newPassword1 != newPassword2) {
            req.flash('error', 'The twice inputs of the new password are different.');
            return res.redirect(redirectUrl);
        }

        Async.waterfall(
            [
                function (cb) {
                    db.Admin.find({id: id, password: password}).complete(cb);
                },
                function (admin, cb) {
                    admin.updateAttributes({
                        password: newPassword1
                    }, ['password']).complete(cb);
                }
            ],
            function (err, admin) {

                if (err) {
                    logger.error(err);
                    req.flash('error', 'Failed to change the password.');
                    res.redirect('/admins/0');
                } else {
                    if (admin) {
                        req.flash('success', 'Change the password successfully. Please relogin.');
                        req.session.currentAdmin = null;
                        res.redirect('/login');
                    } else {
                        req.flash('error', 'Failed to change the password.');
                        res.redirect('/admins/0');
                    }
                }
            }
        );
    });


// **************** Admin list logic end **************************//


// **************** Category logic start **************************//

    app.get('/categories/treeview', checkLogin, function (req, res) {

        db.Category.findAll({
            where: {level: 1, parent_id: 0},
            include: [
                {model: db.Category, as: 'Children', include: [
                    {model: db.Category, as: 'Children'}
                ]}
            ]
        }).complete(function (err, roots) {
            if (err) {
                logger.error(err);

                req.flash('error', 'Faile to load the category tree.');
                return res.redirect('/error');
            }

            res.render('category_treeview', {
                title: 'Show Categories',
                roots: roots
            });
        });
    });

    app.get('/categories/output', checkLogin, function (req, res) {

        var fileName = 'categories_output';
        var fileContent = [];
        fileContent.push('category_titles');

        db.Category.findAll({
            where: {level: 1, parent_id: 0},
            include: [
                {model: db.Category, as: 'Children', include: [
                    {model: db.Category, as: 'Children'}
                ]}
            ]
        }).complete(function (err, roots) {
            if (err) {
                logger.error(err);

                req.flash('error', 'Failed to output the category tree.');
                return res.redirect('/error');
            }

            _.each(roots, function (root) {
                fileContent.push(root.title);
                _.each(root.children, function (subCategory) {
                    fileContent.push(root.title + ' / ' + subCategory.title);
                    _.each(subCategory.children, function (child) {
                        fileContent.push(root.title + ' / ' + subCategory.title + ' / ' + child.title);
                    });
                });
            });

            res.attachment(fileName);
            res.send(200, fileContent.join('\n'));
        });
    });

    app.post('/categories/add', checkLogin, function (req, res) {

            var rootId = req.body.rootId;
            var subCategoryId = req.body.subCategoryId;
            var title = req.body.categoryTitle;

            var redirectUrl = req.get('Referer') ? req.get('Referer') : '/categories/editview';

            if (!title) {
                return res.redirect(redirectUrl);
            }

            if (!rootId) {

                db.Category.create({
                    title: title, parent_id: 0, level: 1
                }).complete(function (err, root) {

                    if (err) {
                        logger.error(err);

                        req.flash('error', 'Failed to add the root category.');
                    } else {
                        if (root) {
                            req.flash('success', 'Add the root category successfully.');
                        } else {
                            req.flash('error', 'Failed to add the root category.');
                        }
                    }
                    res.redirect(redirectUrl);
                });

            } else {

                if (!subCategoryId) {

                    Async.series(
                        {
                            root: function (cb) {

                                db.Category.find(rootId).success(function (root) {
                                    if (root) {
                                        cb(null, root);
                                    } else {
                                        cb("Please specify a root category to create the sub category.", null);
                                    }
                                }).error(function (err) {
                                    cb(err, null);
                                });

                            },
                            subCategory: function (cb) {
                                db.Category.create({
                                    title: title, parent_id: rootId, level: 2
                                }).complete(cb);
                            }
                        },
                        function (err, results) {
                            if (err) {
                                logger.error(err);
                                req.flash('error', 'Failed to add the sub category.');
                            } else {
                                if (results.subCategory) {
                                    req.flash('success', 'Add the sub category successfully.');
                                } else {
                                    req.flash('error', 'Failed to add the sub category.');
                                }
                            }
                            return res.redirect(redirectUrl);
                        }
                    );
                }
                else {

                    Async.series(
                        {
                            root: function (cb) {

                                db.Category.find(rootId).success(function (root) {
                                    if (root) {
                                        cb(null, root);
                                    } else {
                                        cb('Please specify a root category to create the sub category.', null);
                                    }
                                }).error(function (err) {
                                    cb(err, null);
                                });

                            },
                            subCategory: function (cb) {

                                db.Category.find(subCategoryId).success(function (subCategory) {
                                    if (subCategory) {
                                        cb(null, subCategory);
                                    } else {
                                        cb('Please specify a sub category to create the child category.', null);
                                    }
                                }).error(function (err) {
                                    cb(err, null);
                                });

                            },
                            child: function (cb) {

                                db.Category.create({
                                    title: title, parent_id: subCategoryId, level: 3
                                }).complete(cb);

                            }
                        },
                        function (err, results) {
                            if (err) {
                                logger.error(err);
                                req.flash('error', 'Failed to add the child category.');
                            } else {

                                if (results.child) {
                                    req.flash('success', 'Add the child category successfully.');
                                } else {
                                    req.flash('error', 'Failed to add the child category.');
                                }
                            }
                            return res.redirect(redirectUrl);
                        }
                    );
                }
            }
        }
    );

    app.get('/categories/editview/:rootId?/:subCategoryId?', checkLogin, function (req, res) {

        var rootId = req.params.rootId;
        var subCategoryId = req.params.subCategoryId;

        var selectedRootId = 0;
        var selectedSubCategoryId = 0;

        db.Category.findAll({
            where: {level: 1, parent_id: 0},
            include: [
                {model: db.Category, as: 'Children', include: [
                    {model: db.Category, as: 'Children'}
                ]}
            ]
        }).complete(function (err, roots) {
            if (err) {
                logger.error(err);

                req.flash('error', 'Failed to load the category.');
                return res.redirect('/error');
            }

            var subCategories = [];
            var children = [];


            if (rootId) {
                var root = _.find(roots, {id: parseInt(rootId)});
                if (root) {
                    selectedRootId = rootId;
                    subCategories = root.children;
                } else {
                    logger.warn('Wrong root category id : ' + rootId);

                    req.flash('error', 'Wrong root category id');
                    return res.redirect('/error');
                }
            }

            if (subCategoryId) {
                var subCategory = _.find(subCategories, {id: parseInt(subCategoryId)});
                if (subCategory) {
                    selectedSubCategoryId = subCategoryId;
                    children = subCategory.children;
                } else {
                    logger.warn('Wrong sub category id : ' + subCategoryId);

                    req.flash('error', 'Wrong sub category id');
                    return res.redirect('/error');
                }
            }

            res.render('category_editview', {
                title: 'Add Categories',
                roots: roots,
                selectedRootId: selectedRootId,
                subCategories: subCategories,
                selectedSubCategoryId: selectedSubCategoryId,
                children: children
            });

        });
    });

// **************** Category logic end **************************//

// **************** Language logic start **************************//

    app.get('/languages/set/:id', checkLogin, function (req, res) {

        var id = req.params.id;
        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/languages';

        db.Language.find(id).success(function (language) {

            if (language) {
                req.session.language = language;
                req.flash('success', 'Changed the language to ' + language.title);
                res.redirect(redirectUrl);

            } else {
                db.Language.find({
                    where: {iso_code: 'en'}
                }).success(function (lang) {
                    if (!lang) {
                        req.session.language = null;
                        req.flash('error', 'Cannot find the specified language and the default language. ');
                    } else {
                        req.session.language = lang;
                        req.flash('error', 'Cannot find the specified language. Use default language "en" instead.');
                    }
                    res.redirect(redirectUrl);

                }).error(function (err) {
                    logger.error(err);

                    req.flash('error', 'Failed to set the language.');
                    res.redirect(redirectUrl);
                });
            }
        }).error(function (err) {
            logger.error(err);

            req.flash('error', 'Failed to set the language.');
            res.redirect(redirectUrl);
        });
    });

    app.get('/languages/enable/:id', checkLogin, function (req, res) {

        var id = req.params.id;
        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/languages';

        Async.waterfall([
                function (cb) {
                    db.Language.find(id).success(function (language) {
                        if (language) {
                            cb(null, language);
                        } else {
                            cb('The language does not exists.', null);
                        }
                    }).error(function (err) {
                        cb(err, null);
                    });
                },
                function (language, cb) {
                    language.updateAttributes({
                        status: 1
                    }, ['status']).complete(cb);
                }
            ],
            function (err, language) {

                if (err) {
                    logger.error(err);
                    req.flash('error', 'Failed to enable the language.');
                } else {
                    if (language) {
                        req.flash('success', 'Enable the language successfully. Please relogin');
                        req.session.currentAdmin = null;
                        return res.redirect('/login');
                    } else {
                        req.flash('error', 'Failed to enable the language.');
                    }
                }
                res.redirect(redirectUrl);
            }
        );
    });

    app.get('/languages/disable/:id', checkLogin, function (req, res) {

        var id = req.params.id;
        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/languages';

        Async.waterfall([
                function (cb) {
                    db.Language.find(id).success(function (language) {
                        if (language) {
                            cb(null, language);
                        } else {
                            cb('The language does not exists.', null);
                        }
                    }).error(function (err) {
                        cb(err, null);
                    });
                },
                function (language, cb) {
                    language.updateAttributes({
                        status: 0
                    }, ['status']).complete(cb);
                }
            ],
            function (err, language) {

                if (err) {
                    logger.error(err);
                    req.flash('error', 'Failed to disable the language.');
                } else {
                    if (language) {
                        req.flash('success', 'Disable the language successfully. Please relogin.');
                        req.session.currentAdmin = null;
                        return res.redirect('/login');
                    } else {
                        req.flash('error', 'Failed to disable the language.');
                    }
                }
                res.redirect(redirectUrl);
            }
        );
    });

    app.post('/languages/create', checkLogin, function (req, res) {

        db.Language.create(req.body, ['iso_code', 'status', 'title'])
            .complete(function (err, language) {
                if (err) {
                    logger.error(err);
                    req.flash('error', 'Failed to create the new language.');
                } else {
                    if (language) {
                        req.flash('success', 'Create new language successfully. Please relogin');
                        req.session.currentAdmin = null;
                        return res.redirect('/login');
                    } else {
                        req.flash('error', 'Failed to create the new language.');
                    }
                }
                res.redirect('/languages');
            });
    });

    app.get('/languages/create', checkLogin, function (req, res) {

        res.render('create_language', {
            title: 'Create New Language'
        });
    });

    app.get('/languages', checkLogin, function (req, res) {

        var redirectUrl = req.get('Referer') ? req.get('Referer') : '/languages';

        db.Language.findAll().complete(function (err, languages) {
            if (err) {
                logger.error(err);

                req.flash('error', 'Failed to load the languages.');
                return res.redirect('/error');
            }

            res.render('languages', {
                title: 'Language List',
                languages: languages
            });
        });
    });


// **************** Language logic end **************************//


// **************** Admin log logic start **************************//

    app.get('/logs/:range', checkLogin, checkSuperAdmin, function (req, res) {

        var range = req.params.range;

        var dateRange = Utils.getDateFromRange(range);
        if (!dateRange) {
            logger.warn('Unsupported time range : ' + range);

            req.flash('error', 'Unsupported time range : ' + range);
            return res.redirect('/logs/month/0');
        }

        var rangeText = Utils.getTextFromRange(range);
        var redirectUrl = '/logs/' + range + '/0';

        if (!req.query.search) {
            res.redirect(redirectUrl);

        } else {

            var searchWord = req.query.search;

            db.Log.findAll({
                where: {
                    created_at: {
                        gte: dateRange
                    },
                    operator: {
                        like: '%' + searchWord + '%'
                    }
                }
            }).complete(function (err, logs) {

                if (err) {
                    logger.error(err);

                    req.flash('error', 'Failed to load the logs.');
                    return res.redirect('/error');
                }

                var pagination = new Pagination(0, 1);

                res.render('logs', {
                    pagination: pagination,
                    logs: logs,
                    title: 'Search Results',
                    searchWord: searchWord,
                    rangeText: rangeText,
                    range: range
                });

            });
        }
    });

    app.get('/logs/:range/:page', checkLogin, checkSuperAdmin, function (req, res) {

        var range = req.params.range;
        var currentPage = req.params.page;

        var dateRange = Utils.getDateFromRange(range);
        if (!dateRange) {
            logger.warn('Unsupported time range : ' + range);

            req.flash('error', 'Unsupported time range : ' + range);
            return res.redirect('/logs/month/0');
        }

        var rangeText = Utils.getTextFromRange(range);

        var offset = currentPage * settings.numberPerPage;
        var limit = settings.numberPerPage;

        db.Log.findAndCountAll({
            where: {
                created_at: {
                    gte: dateRange
                }
            },
            offset: offset,
            limit: limit,
            order: [
                ['id', 'ASC']
            ]
        }).complete(function (err, results) {
            if (err) {
                logger.error(err);

                req.flash('error', 'Failed to load the logs.');
                return res.redirect('/error');
            }

            var sum = results.count;
            var logs = results.rows;

            var totalPages = parseInt((sum + settings.numberPerPage - 1) / settings.numberPerPage);
            var pagination = new Pagination(currentPage, totalPages);

            res.render('logs', {
                pagination: pagination,
                logs: logs,
                title: 'Log List',
                searchWord: '',
                rangeText: rangeText,
                range: range
            });
        });
    });

    app.get('/index', checkLogin, function (req, res) {
        res.render('index');
    });

// **************** AdminLog list logic end **************************//

    app.get('/error', function (req, res) {
        res.render('error');
    });


    function checkLogin(req, res, next) {

        if ('production' == app.get('env')) {
            if (!req.session.currentAdmin) {
                req.flash('error', 'Please login first.');
                return res.redirect('/login');
            }
        }
        next();
    }

    function checkSuperAdmin(req, res, next) {
        if (!req.session.currentAdmin.is_super_admin) {
            req.flash('error', 'No permission on this operation.');
            return res.redirect('/index');
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.currentAdmin) {
            req.flash('error', 'You are already login.');
            return res.redirect('/index');
        }
        next();
    }

    function checkAdminPermission(req, res, next) {
        var id = req.params.id;
        var currentAdmin = req.session.currentAdmin;

        if (!currentAdmin || currentAdmin.id != id) {
            req.flash('error', 'No permission for operating on this user.');
            res.redirect('/admins/0');
        }
        next();
    }
};