/**
 * Module dependencies
 */
var request = require('request'),
    config = require('./config'),
    events = require('events'),
    cheerio = require('cheerio'),
    qs = require('querystring'),
    crypto = require('crypto'),
    eventEmitter = new events.EventEmitter(),
    db = require('./db')(),
    express = require('express'),
    routes = require('./app/routes/router'),
    http = require('http'),
    path = require('path'),
    async = require('async'),
    AWS = require('aws-sdk'),
    ses = new AWS.SES(),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
var userSettings;
var User;
var app = express();

var global_blacklist = require('./config/blacklist');
var global_whitelist = require('./config/whitelist');

// Grabs user settings explicitly in order to quickly update
var getUserSettings = function () {
    db.driver.execQuery('SELECT * FROM users_settings', function (err, data) {
        if (err) {
            console.error('ERROR GETTING USER SETTINGS: ' + err);
        }
        userSettings = data;
        console.log('Successfully loaded new user settings');
    });
};

// Initialization function definition.
var init = function () {
    // Load Models
    db.load('./app/models/user', function (err) {
        if (err) {
            console.error('Error loading User model' + err);
        }
        else {
            User = db.models.users;
        }
    });
    // Loads initial user stats after users have been loaded.
    getUserSettings();
};

// Grabs the body & selects only the 'latest pastes'. Parses the URLs
var parseLatestUrls =  function (body, cb) {
    var $ = cheerio.load(body);
    $('ul.right_menu > li > a').map(function (i, item) {
        var m = $(item).attr('href').replace('\/', ''),
            url = 'http://pastebin.com/raw.php?',
            params = { i: m };
        url += qs.stringify(params);
        cb(url);
    });
};

// Verify that the body of each post does not contain anything currently blacklisted
var checkBlacklist = function (body, url, cb) {
    var blacklist = global_blacklist,
    isntBlacklisted = true;

    for (var filter in blacklist) {
        if (!(blacklist[filter].reg.test(body))) {
            isntBlacklisted = true;
        }
        else {
            isntBlacklisted = false;
            break;
        }
    }
    if (isntBlacklisted) {
        cb(body, url);
    }
};

// If the body passed the blacklist filter, we then figure out what it contains and if it is of any interest
var masterFilter = function (body, url, cb) {
    var filters = global_whitelist;

    for (var filter in filters) {
        if (filters[filter].reg.test(body)) {
            filters[filter].count = body.match(filters[filter].reg).length;
        }
    }
    // After we have counted the occurrences, we pass it through to the callback with the counts
    var cbFilters = filters;
    cb(body, url, cbFilters);

    // And then we reset the counters
    for (var filter in filters) {
        if (filters.hasOwnProperty(filter)) {
            filters[filter].count = 0;
        }
    }
};

// Determines if a paste is indeed interesting to a user
var userFilter = function (body, url, cbFilters, cb) {
    // Loop through the userSettings array
    for (var i = 0; i < userSettings.length; i += 1) {
        // Get individual user's settings
        for (var filter in cbFilters) {
            if (cbFilters.hasOwnProperty(filter)) {
                var indivUserSettings = {};
                indivUserSettings = userSettings[i];
                // if individual user setting matches what's currently in the body, do something.
                if (indivUserSettings[filter] <= cbFilters[filter].count) {
                    cb(body, url, indivUserSettings, filter, cbFilters);
                }
            }
        }
    }
};

// PassportJS Serialize
passport.serializeUser(function (user, done) {
    done(null, user[0].id);
});

passport.deserializeUser(function (id, done) {
    User.get(id, function (err, user) {
        done(err, user);
    });
});

// Begin Execution
init();
// development only
if ('development' === app.get('env') || 'test' === app.get('env')) {
    app.use(express.errorHandler());
    app.set('views', __dirname + '/app/front/views');
    app.set('view engine', 'jade');
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'app/front')));
}
else if ('production' === app.get('env')) {
    require('newrelic');
    app.set('views', __dirname + '/dist');
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(express.static(path.join(__dirname, 'dist')));
}

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'my_precious' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(function (req, res, next) {
        res.status(404);

        // respond with html page
        if (req.accepts('html')) {
            res.render('404', { url: req.url });
            return;
        }

      // respond with json
        if (req.accepts('json')) {
            res.send({ error: 'Not found' });
            return;
        }

      // default to plain-text. send()
        res.type('txt').send('Not found');
    });

// Grunt Stuff
module.exports = http.createServer(app).listen(app.get('port'), function () {
    console.log('Pasteye server listening on port ' + app.get('port') + ' in ' + app.get('env') + ' environment.');
});
module.exports.use = function () {
    app.use.apply(app, arguments);
};
module.exports.express = app;

module.exports.db = db;

// PassportJS strategies
passport.use(new LocalStrategy(
    function (username, password, done) {
        User.find({ username: username }, function (err, user) {
            if (err) {
                return done(err);
            }
            else if (!user[0]) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user[0].authenticate(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

/*
 * Frontend Routing & Relative user actions
 */
app.get('/', function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.render('splash');
    }
},
    function (req, res) {
        res.redirect('/app');
    });
app.get('/beta', routes.beta);
app.get('/login', function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.render('login');
    }
},
    function (req, res) {
        res.redirect('/app');
    });
app.get('/signup', routes.signup);
app.get('/app', function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect('/login');
    }
}, function (req, res) {
    res.render('app', {user: req.user});
});
app.get('/user/me', function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect('/login');
    }
}, function (req, res) {
    res.send(req.user, 200);
});
app.get('/user/me/settings', function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect('/login');
    }
}, function (req, res) {
    User.get(req.user.id, function (err, user) {
        if (err) {
            res.send('No such user', 500);
        }
        user.getSettings(function (err, settings) {
            res.send(settings, 200);
        });
    });
});
app.get('/user/me/stats', function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect('/login');
    }
}, function (req, res) {
    User.get(req.user.id, function (err, user) {
        if (err) {
            res.send('No such user', 500);
        }
        user.getStats(function (err, stats) {
            res.send(stats, 200);
        });
    });
});
app.get('/logout', function (req, res)  {
    req.logout();
    res.redirect('/');
});
app.get('/resetpassword', routes.resetPassword);
app.get('/verifyuser', routes.verifyUser);
app.get('/verifyEmail', routes.verifyEmail);
app.get('/resendEmail', routes.resendEmail);
app.get('/forgotpassword', routes.forgotPassword);

app.post('/login',
    passport.authenticate('local'),
    function (req, res, next) {
        if (req.user[0].activated) {
            return next();
        }
        else {
            res.send('Your account has not been activated yet. Please check your e-mail for further instructions.', 406);
        }
    },
    function (req, res) {
    // If this function gets called, authentication & activation verification was successful.
        res.send('You have successfully logged in.', 200);
    });
app.post('/verifyUser', function (req, res) {
    var dateVerify = new Date();
    if (dateVerify.getDate().toString() === req.body.emailToken.toString().substr(0, dateVerify.getDate().toString().length)) {
        User.find({ userEmail: req.body.userEmail }, function (err, user) {
            if (err) {
                res.send(err, 500);
            }
            else {
                var digest = dateVerify.getDate() + crypto.createHmac('sha256', config.secretKey).update(dateVerify.getDate() + req.body.userEmail + user.id).digest('base64');
                if (digest === req.body.emailToken) {
                    var randPass = crypto.randomBytes(8).toString('base64');
                    user[0].password = randPass;
                    user[0].save(function (err) {
                        if (err) {
                            res.send(err, 500);
                        }
                        else {
                            res.send('Your password has been randomly regenerated. Please change it immediately in your user settings. Your password is: ' + randPass, 200);
                        }
                    });
                }
                else {
                    res.send('Invalid token. Please verify that the token you have entered is exactly the same as the one sent to you via e-mail.', 400);
                }
            }
        });
    }
    else {
        res.send('Your token has expired. Please generate a new one.', 400);
    }
});
app.post('/verifyEmail', function (req, res) {
    var dateVerify = new Date();
    if (dateVerify.getDate().toString() === req.body.emailToken.toString().substr(0, dateVerify.getDate().toString().length)) {
        User.find({ userEmail: req.body.userEmail }, function (err, user) {
            if (err) {
                res.send(err, 500);
            }
            else {
                var digest = dateVerify.getDate() + crypto.createHmac('sha256', config.secretKey).update(dateVerify.getDate() + user[0].userEmail).digest('base64');
                if (digest === req.body.emailToken) {
                    user[0].activated = true;
                    user[0].save(function (err) {
                        if (err) {
                            res.send(err, 500);
                        }
                        else {
                            res.send('You have been successfully activated.', 200);
                        }
                    });
                }
                else {
                    res.send('Invalid token. Please verify that the token you have entered is exactly the same as the one sent to you via e-mail.', 400);
                }
            }
        });
    }
    else {
        res.send('Your token has expired. Please generate a new one.', 400);
    }
});
app.post('/forgotPassword', function (req, res) {
    var date = new Date();
    User.find({ userEmail: req.body.userEmail }, function (err, user) {
            if (err || user.length  === 0) {
                res.send(err, 500);
            }
            else {
                var token = date.getDate() + crypto.createHmac('sha256', config.secretKey).update(date.getDate() + req.body.userEmail + user.id).digest('base64');
                ses.sendEmail({
                Source: 'noreply@' + config.host,
                Destination: {
                    ToAddresses: [req.body.userEmail]
                },
                Message: {
                    Subject: {
                        Data: 'Reset your password confirmation'
                    },
                    Body: {
                        Text: {
                            Data: 'Please visit http://'+ config.host + '/verifyuser and enter this token to begin the process of resetting your password: ' + token
                        }
                    }
                }
                }, function (err, data) {
                    if (err) {
                        res.send(err, 500);
                    }
                    else {
                        res.send('Success!', 200);
                    }
                });
            }
    });
});
app.post('/resendEmail', function (req, res) {
    var date = new Date();
    User.find({ userEmail: req.body.userEmail }, function (err, user) {
        if (err) {
            res.send(err, 500);
        }
        else {
            var emailToken = date.getDate() + crypto.createHmac('sha256', config.secretKey).update(date.getDate() + req.body.userEmail).digest('base64');
            ses.sendEmail({
                Source: 'noreply@' + config.host,
                Destination: {
                    ToAddresses: [req.body.userEmail]
                },
                Message: {
                    Subject: {
                        Data: 'Thanks for registering!'
                    },
                    Body: {
                        Text: {
                            Data: 'Please visit http://'+ config.host + '/verifyEmail and enter this token when prompted: ' + emailToken
                        }
                    }
                }
            }, function (err, data) {
                if (err) {
                    res.send(err, 500);
                }
                else {
                    res.send('Success!', 200);
                }
            });
        }
    });
});

/*
 * (Public?) API
 */
app.get('/api', function (req, res) {
    res.send('Pasteye API is running!');
});

// ##USERS##
// Get all users
app.get('/api/users', function (req, res) {
    if ('apikey' in req.body) {
        User.find({ apikey: req.body.apikey }, function (err, user) {
            if (err) {
                res.send(err, 500);
            }
            else if (user[0] === undefined || user.length > 1) {
                res.send('ERROR!', 500);
            }
            else if (user[0].isAdmin()) {
                db.driver.execQuery('SELECT users.username, "userEmail", users.id, users_settings.ip, users_settings.email, users_settings.hash FROM users, users_settings WHERE users.id = users_settings.users_id ORDER BY users.id', function (err, data) {
                    if (err) {
                        res.send(err, 500);
                    }
                    res.send(data, 200);
                });
            }
            else {
                res.send('You are unauthorized to perform this action.', 401);
            }
        });
    }
    else {
        res.send('Invalid query. Please include a valid API key', 400);
    }
});

// Get a user by ID
app.get('/api/users/:id', function (req, res) {
    if (req.params.id !== undefined) {
        if ('apikey' in req.body) {
            User.find({ apikey: req.body.apikey }, function (err, user) {
                if (err) {
                    res.send(err, 500);
                }
                else if (user[0] === undefined || user.length > 1) {
                    res.send('ERROR!', 500);
                }
                else if (user[0].isAdmin()) {
                    User.get(req.params.id, function (err, user) {
                        if (err) {
                            res.send('No such user', 500);
                        }
                        user.getSettings(function (err, settings) {
                            res.send(JSON.stringify({username: user.username, userEmail: user.userEmail, id: user.id}, null, '\t') + JSON.stringify({ip: settings.ip, email: settings.email, hash: settings.hash}, null, '\t'));
                        });
                    });
                }
                else {
                    res.send('You are unauthorized to perform this action.', 401);
                }
            });
        }
        else {
            res.send('Invalid query. Please include a valid API key', 400);
        }
    }
});

// Get a user's settings by ID
app.get('/api/users/:id/settings', function (req, res) {
    if (req.params.id !== undefined) {
        if ('apikey' in req.body) {
            User.find({ apikey: req.body.apikey }, function (err, user) {
                if (err) {
                    res.send(err, 500);
                }
                else if (user[0] === undefined || user.length > 1) {
                    res.send('ERROR!', 500);
                }
                else if (user[0].isAdmin()) {
                    User.get(req.params.id, function (err, user) {
                        if (err) {
                            res.send('No such user', 500);
                        }
                        user.getSettings(function (err, settings) {
                            res.send(JSON.stringify(settings, null, '\t'));
                        });
                    });
                }
                else {
                    res.send('You are unauthorized to perform this action.', 401);
                }
            });
        }
        else {
            res.send('Invalid query. Please include a valid API key', 400);
        }
    }
});

// Create a new user with or without settings
app.post('/api/users', function (req, res) {
    if ('apikey' in req.body) {
        User.find({ apikey: req.body.apikey }, function (err, user) {
            if (err) {
                res.send(err, 500);
            }
            else if (user[0] === undefined || user.length > 1) {
                res.send('ERROR!', 500);
            }
            else if (user[0].isAdmin()) {
                if ('users' in req.body && req.body.users instanceof Array) {
                    var tempUserCB = function (err) {
                        if (err) {
                            res.send(err, 500);
                        }
                        else {
                            tempUser.setStats({ip: 0, email: 0, hash: 0}, function (err) {
                                if (err) {
                                    res.send(err, 500);
                                }
                                else {
                                    tempUser.save(function (err) {
                                        if (err) {
                                            res.send(err, 500);
                                        }
                                        else {
                                            var date = new Date();
                                            var emailToken = date.getDate() + crypto.createHmac('sha256', config.secretKey).update(date.getDate() + req.body.userEmail).digest('base64');
                                            // Construct E-mail with Token + /verifyEmail && Send
                                            ses.sendEmail({
                                                Source: 'noreply@' + config.host,
                                                Destination: {
                                                    ToAddresses: [tempUser.userEmail]
                                                },
                                                Message: {
                                                    Subject: {
                                                        Data: 'Thanks for registering!'
                                                    },
                                                    Body: {
                                                        Text: {
                                                            Data: 'Please visit http://'+ config.host + '/verifyEmail and enter this token when prompted: ' + emailToken
                                                        }
                                                    }
                                                }
                                            }, function (err, data) {
                                                if (err) {
                                                    res.send(err, 500);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    };
                    var tempUserErr = function (err) {
                        if (err) {
                            res.send(err, 500);
                        }
                    };
                    for (var i = 0; i < req.body.users.length; i += 1) {
                        var userFull = req.body.users[i];
                        if ('username' in userFull && 'password' in userFull && 'userEmail' in userFull && 'ip' in userFull && 'email' in userFull && 'hash' in userFull) {
                            var tempUser = new User({ username: userFull.username, password: userFull.password, userEmail: userFull.userEmail });
                            var tempUserSettings = { ip: userFull.ip, email: userFull.email, hash: userFull.hash };
                            tempUser.setSettings(tempUserSettings, tempUserCB);
                        }
                        else if ('username' in userFull && 'password' in userFull && 'userEmail' in userFull) {
                            var tempUser1 = new User({ username: userFull.username, password: userFull.password, userEmail: userFull.userEmail });
                            tempUser1.save(tempUserErr);
                        }
                    }
                    res.send('Batch operation completed.', 200);
                }
            }
            else {
                res.send('You are unauthorized to perform this action.', 401);
            }
        });
    }

    else if ('username' in req.body && 'password' in req.body && 'userEmail' in req.body && 'ip' in req.body && 'email' in req.body && 'hash' in req.body) {
        var reqUser = new User({ username: req.body.username, password: req.body.password, userEmail: req.body.userEmail });
        reqUser.setSettings({ip: req.body.ip, email: req.body.email, hash: req.body.hash }, function (err) {
            if (err) {
                res.send(err, 500);
            }
            else {
                reqUser.setStats({ip: 0, hash: 0, email: 0}, function (err) {
                    if (err) {
                        res.send(err, 500);
                    }
                    else {
                        reqUser.save(function (err) {
                            if (err) {
                                res.send(err, 500);
                            }
                            else {
                                reqUser.getSettings(function (err, settings) {
                                    if (err) {
                                        res.send(err, 500);
                                    }
                                    else {
                                        var date = new Date();
                                        var emailToken = date.getDate() + crypto.createHmac('sha256', config.secretKey).update(date.getDate() + req.body.userEmail).digest('base64');
                                        // Construct E-mail with Token + /verifyEmail && Send
                                        ses.sendEmail({
                                            Source: 'noreply@' + config.host,
                                            Destination: {
                                                ToAddresses: [reqUser.userEmail]
                                            },
                                            Message: {
                                                Subject: {
                                                    Data: 'Thanks for registering!'
                                                },
                                                Body: {
                                                    Text: {
                                                        Data: 'Please visit http://'+ config.host + '/verifyEmail and enter this token when prompted: ' + emailToken
                                                    }
                                                }
                                            }
                                        }, function (err, data) {
                                            if (err) {
                                                res.send(err, 500);
                                            }
                                            else {
                                                res.send('Successfully created user & dispatched e-mail to ' + reqUser.username + ' with settings: ' + JSON.stringify(settings, null, '\t'), 200);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

    }
    else if ('username' in req.body && 'password' in req.body && 'userEmail' in req.body) {
        var reqUser = new User({ username: req.body.username, password: req.body.password, userEmail: req.body.userEmail });
        reqUser.save(function (err) {
            if (err) {
                res.send(err, 500);
            }
            else {
                res.send('Successfully created user ' + reqUser.username + '.', 200);
            }
        });
    }
    else {
        res.send('Invalid query.', 400);
    }
});

app.put('/api/users/:id', function (req, res) {
    if (req.params.id !== undefined) {
        if ('apikey' in req.body) {
            User.find({ apikey: req.body.apikey }, function (err, user) {
                if (err) {
                    res.send(err, 500);
                }
                else if (user[0] === undefined || user.length > 1 || user.length === 0) {
                    res.send('ERROR!', 500);
                }
                else if (user[0].isAdmin() || user[0].getId() === parseInt(req.params.id, 10)) {
                    User.get(req.params.id, function (err, user) {
                        if (err) {
                            res.send('No such user', 500);
                        }
                        else {
                            user.getSettings(function (err, settings) {
                                if (err) {
                                    res.send(err, 500);
                                }
                                else {
                                    var fullObj = { username: user.username, password: user.password, userEmail: user.userEmail, ip: settings.ip, email: settings.email, hash: settings.hash };
                                    var userObj = { username: user.username, password: user.password, userEmail: user.userEmail };
                                    var settingsObj = { ip: settings.ip, email: settings.email, hash: settings.hash };
                                    var successArray = [];
                                    var userSettingsErr = function (err) {
                                        if (err) {
                                            res.send(err, 500);
                                        }
                                    };
                                    var emailErr = function (err, data) {
                                        if (err) {
                                            res.send(err, 500);
                                        }
                                    };

                                    for (var param in fullObj) {
                                        if (fullObj.hasOwnProperty(param)) {
                                            if (param in req.body && param in settingsObj) {
                                                settingsObj[param] = req.body[param];
                                                user.setSettings(settingsObj, userSettingsErr);
                                                successArray.push(param);
                                            }
                                            if (param in req.body && param in userObj) {
                                                if (param === 'userEmail') {
                                                    var date = new Date();
                                                    var emailToken = date.getDate() + crypto.createHmac('sha256', config.secretKey).update(date.getDate() + req.body.userEmail).digest('base64');
                                                    // Construct E-mail with Token + /verifyEmail && Send
                                                    ses.sendEmail({
                                                        Source: 'noreply@' + config.host,
                                                        Destination: {
                                                            ToAddresses: [user.userEmail]
                                                        },
                                                        Message: {
                                                            Subject: {
                                                                Data: 'You recently changed your profile E-mail address.'
                                                            },
                                                            Body: {
                                                                Text: {
                                                                    Data: 'Hi there. You recently changed your Pasteye profile e-mail address. If this is correct, please visit http://'+ config.host + '/verifyEmail and enter this token when prompted: ' + emailToken + '\nYou will not receive any further monitor notifications until you re-verify your account with us.'
                                                                }
                                                            }
                                                        }
                                                    }, emailErr());
                                                    user.activated = false;
                                                }
                                                user[param] = req.body[param];
                                                successArray.push(param);
                                            }
                                        }
                                    }
                                    if (successArray.length > 0) {
                                        user.save(function (err) {
                                            if (err) {
                                                res.send(err, 500);
                                            }
                                            else {
                                                res.send('Successfully updated user ' + user.id + ' with settings: ' + successArray.join(), 200);
                                                console.log('Successfully updated user ' + user.id + ' with settings: ' + successArray.join());
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
                else {
                    res.send('You are unauthorized to perform this action.', 401);
                }
            });
        }
        else {
            res.send('Invalid query. Please include a valid API key', 400);
        }
    }
});

app.delete('/api/users', function (req, res) {
    if ('apikey' in req.body) {
        User.find({ apikey: req.body.apikey }, function (err, user) {
            if (err) {
                res.send(err, 500);
            }
            else if (user[0] === undefined || user.length > 1 || user.length === 0) {
                res.send('ERROR!', 500);
            }
            else {
                if ('users' in req.body && req.body.users instanceof Array) {
                    if (user[0].isAdmin()) {
                        var userFindCB = function (err, foundUsers) {
                            if (err) {
                                res.send(err, 500);
                            }
                            if (foundUsers[0] === undefined || foundUsers.length === 0) {
                                res.send(err, 500);
                            }
                            else {
                                foundUsers[0].removeSettings(usersSettingsErr);
                            }
                        };
                        var usersSettingsErr = function (err) {
                            if (err) {
                                res.send(err, 500);
                            }
                            else {
                                foundUsers[0].removeStats(function (err) {
                                    if (err) {
                                        res.send(err, 500);
                                    }
                                });
                            }
                        };
                        var userRemoveErr = function (err) {
                            if (err) {
                                res.send(err, 500);
                            }
                        };
                        var userGetCB =  function (err, foundUser) {
                            if (err) {
                                res.send(err, 500);
                            }
                            else {
                                foundUser.removeSettings(function (err) {
                                    if (err) {
                                        res.send(err, 500);
                                    }
                                    else {
                                        foundUser.removeStats(function (err) {
                                            if (err) {
                                                res.send(err, 500);
                                            }
                                        });
                                    }
                                });
                                foundUser.remove(function (err) {
                                    if (err) {
                                        res.send(err, 500);
                                    }
                                });
                            }
                        };
                        for (var i = 0; i < req.body.users.length; i += 1) {
                            if ('username' in req.body.users[i]) {
                                User.find({ username: req.body.users[i].username }, userFindCB);
                                User.find({ username: req.body.users[i].username }).remove(userRemoveErr);
                            }
                            else if ('id' in req.body.users[i]) {
                                User.get(req.body.users[i].id, userGetCB);
                            }
                        }
                        res.send('Batch operation completed successfully', 200);
                    }
                    else {
                        res.send('You are unauthorized to perform this action.', 401);
                    }
                }
                else if ('username' in req.body) {
                    if (user[0].getUsername() === req.body.username || user[0].isAdmin()) {
                        User.find({ username: req.body.username }, function (err, users) {
                            if (err) {
                                res.send(err, 500);
                            }
                            else if (users[0] === undefined || users.length > 1 || users.length === 0) {
                                res.send('ERROR!', 500);
                            }
                            else {
                                users[0].removeSettings(function (err) {
                                    if (err) {
                                        res.send(err, 500);
                                    }
                                    else {
                                        users[0].removeStats(function (err) {
                                            if (err) {
                                                res.send(err, 500);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        User.find({ username: req.body.username }).remove(function (err) {
                            if (err) {
                                res.send(err, 500);
                            }
                            else {
                                req.logout();
                                res.send('Successfully removed user ' + req.body.username, 200);
                            }
                        });
                    }
                    else {
                        res.send('Cannot delete another user.', 401);
                    }
                }
                else if ('id' in req.body) {
                    if (user[0].getId() === req.body.id || user[0].isAdmin()) {
                        User.get(req.body.id, function (err, user) {
                            if (err) {
                                res.send(err, 500);
                            }
                            else if (user === undefined) {
                                res.send('ERROR!', 500);
                            }
                            else {
                                user.removeSettings(function (err) {
                                    if (err) {
                                        res.send(err, 500);
                                    }
                                    else {
                                        user.removeStats(function (err) {
                                            if (err) {
                                                res.send(err, 500);
                                            }
                                        });
                                    }
                                });
                                user.remove(function (err) {
                                    if (err) {
                                        res.send(err, 500);
                                    }
                                    else {
                                        req.logout();
                                        res.send('Successfully removed user ' + req.body.id, 200);
                                    }
                                });
                            }
                        });
                    }
                    else {
                        res.send('Cannot delete another user.', 401);
                    }
                }
            }
        });
    }
    else {
        res.send('Invalid query. Please include a valid API key', 400);
    }
});




setInterval(function () {
    // GET the Pastebin front page
    request('http://pastebin.com/', function (error, response, body) {
        if (!error && response.statusCode === 200) {
            eventEmitter.emit('pageSuccess', body);
        }
    });
}, 25000);

db.on('userSave', function () {
    getUserSettings();
});

eventEmitter.on('pageSuccess', function (body) {
    parseLatestUrls(body, function (url) {
        request(url, function (error, response, body) {
            checkBlacklist(body, url, function (body, url) {
                masterFilter(body, url, function (body, url, cbFilters) {
                    userFilter(body, url, cbFilters, function (body, url, indivUserSettings, filter, cbFilters) {
                        var filterCount = cbFilters[filter].count;
                        User.get(indivUserSettings.users_id, function (err, user) {
                            if (err) {
                                console.error('ERROR @ getting user' + err);
                            }
                            else {
                                if (user.activated) {
                                    // Send an e-mail containing the paste data
                                    ses.sendEmail({
                                        Source: 'noreply@' + config.host,
                                        Destination: {
                                            ToAddresses: [user.userEmail]
                                        },
                                        Message: {
                                            Subject: {
                                                Data: '[NOTIFICATION][' + filter.toString().toUpperCase() + ']'
                                            },
                                            Body: {
                                                Text: {
                                                    Data: 'We think we found ' + filterCount + ' ' + filter + 's in the body of the paste located at URL: ' + url + '\n\n' + body
                                                }
                                            }
                                        }
                                    }, function (err, data) {
                                        if (err) {
                                            console.error('Error sending e-mail: ' + err);
                                        }
                                        else {
                                            console.log('E-mail Success!' + JSON.stringify(data));
                                            user.getStats(function (err, stats) {
                                                if (err) {
                                                    console.error('Error @ getting stats ' + err);
                                                }
                                                else {
                                                    var newStats = { ip: stats.ip, hash: stats.hash, email: stats.email };
                                                    var filterCount = stats[filter];
                                                    newStats[filter] = filterCount + 1;
                                                    user.setStats(newStats, function (err) {
                                                        if (err) {
                                                            console.error('Error setting stats: ' + err);
                                                        }
                                                        else {
                                                            user.save(function (err) {
                                                                if (err) {
                                                                    console.error('Error saving user: ' + err);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });
                        console.log('Found something interesting based on User ' + indivUserSettings.users_id + 's settings.');
                        console.log('We think we found ' + filterCount + ' ' + filter + 's in the body of the paste located at URL: ' + url);
                    });
                });
            });
        });
    });
});
