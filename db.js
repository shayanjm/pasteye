module.exports = function () {
    var orm = require('orm'),
    config = require('./config');
    orm.settings.set('pool', true); // Set up DB Connection pooling
    orm.settings.set("instance.returnAllErrors", true); // Force it to return all validation errors
    if (process.env.NODE_ENV === 'development') {
        var db  = orm.connect(config.db.development.uri);
    }
    else if (process.env.NODE_ENV === 'test') {
        var db = orm.connect(config.db.test.uri);
    }
    else if (process.env.NODE_ENV === 'production') {
        var db = orm.connect(config.db.production.uri);
    }
    db.on("connect", function (err) {
        if (err) {
            console.log("Something is wrong with the connection", err);
            return;
        }
        else {
            console.log('Successfully connected to database!');
        }
    });

    return db;
};
