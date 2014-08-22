var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var session = require('express-session');
var flash = require('connect-flash');

var log4js = require('log4js');
var logger = require('./config/logger.js');

// Settings
var commodityStatus = require('./config/commodity_status.js');
var commodityPriceMode = require('./config/commodity_price_mode.js');

var db = require('./models');

var routes = require('./routes');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(partials());

app.use(favicon());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

if ('development' == app.get('env')) {

    app.use(log4js.connectLogger(logger, {level: 'debug', format: ':method :status :url :referrer'}));
    app.use(session({secret: 'crm', resave: true, saveUninitialized: true }));
    app.use(express.static(path.join(__dirname, 'public/dev')));

} else if ('production' == app.get('env')) {

    app.use(log4js.connectLogger(logger, {level: 'warn', format: ':method :status :url :referrer'}));
    app.use(session({secret: 'crm', resave: true, saveUninitialized: true, cookie: { maxAge: 3600000 }}));
    app.use(express.static(path.join(__dirname, 'public/prod')));
} else {

    app.use(log4js.connectLogger(logger, {level: 'debug', format: ':method :status :url :referrer'}));
    app.use(session({secret: 'crm', resave: true, saveUninitialized: true }));
    app.use(express.static(path.join(__dirname, 'public/dev')));
}

app.use(flash());

// Set global variables.
app.use(function (req, res, next) {

    //Some config setting
    res.locals.commodityStatus = commodityStatus;
    res.locals.commodityPriceMode = commodityPriceMode;

    var error = req.flash('error');
    res.locals.error = error.length ? error : null;

    var success = req.flash('success');
    res.locals.success = success.length ? success : null;

    res.locals.currentAdmin = req.session ? req.session.currentAdmin : null;
    res.locals.language = req.session ? req.session.language : null;
    res.locals.availableLanguages = req.session ? req.session.availableLanguages : null;
    res.locals.currentUrl = req.url;

    next();
});

// Logging for administrators' operation
app.use(function (req, res, next) {

    if (res.locals && res.locals.currentAdmin) {

        db.Log.create({
            operator: res.locals.currentAdmin.username,
            url: req.path
        }).complete(function (err, log) {
            if (err) {
                req.flash('error', err.message);
            }
        });
    }
    next();
});


routes(app);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
