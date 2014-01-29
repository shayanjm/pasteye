module.exports.insert = function (db, done) {
    db.on('connect', function (err) {
        db.driver.execQuery('INSERT INTO users ("username", "password", "userEmail", "apikey", "access", "id") VALUES (\'ShayanTest90\', \'$2a$10$/vSxBCy0ccbWO0VShxB5dephP7dzT5e8fkDsLcC5yfcHsv96lsAzm\', \'ShayanTest90@shayantest30.shayantest30\', \'edQqQkLQN9eOu0t0J3GvRJWrOkRFe5e34lzElmJ7ofWmoC3xAL+eh0b8+sJQkp+jBdY=\', 3, 1), (\'ShayanTest70\', \'$2a$10$4mlPGkETTXz8k1jqsmpEq.BOYTqJntYbP9Um2ZxMKeW78GnTMeu3C\', \'ShayanTest70@shayantest30.shayantest30\', \'/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o=\', 0, 2), (\'ShayanTest80\', \'$2a$10$Fa4OiMGhkgPqCWwUrKUqTO7txM1DRzFhSIjF6N.idD.WVa5naTb8W\', \'ShayanTest80@shayantest30.shayantest30\', \'jWfuC1oJ9HpvZN7GOl7CmlPYmOJF6PbgB3VmRckT/xkwukZuAqc9o/5wwhBMfsDzqVQ=\', 0, 3), (\'ShayanTest60\', \'$2a$10$OEsqjnu9avAmgN/VtZhTMuZ4KgffovgZYbjgDE1mNJpLgqlhm/WkW\', \'ShayanTest60@shayantest30.shayantest30\', \'6fpg0gFAJuGstfG4/tQA6QGMsqBsVBKe6l0TYuf4IxHQXzPeWpi4ERVniM2N4c4v1bs=\', 0, 4)', function (err) {
            if (err) {
                console.log('ERROR ADDING USER FIXTURES: ' + err);
                return done(false);
            }
            else {
                console.log('Successfully added User Fixtures');
                db.driver.execQuery('INSERT INTO users_settings (ip, email, hash, users_id) VALUES (1, 1, 1, 1), (2, 2, 2, 2), (3, 3, 3, 3)', function (err) {
                    if (err) {
                        console.log('ERROR ADDING USER SETTINGS FIXTURES: ' + err)
                    }
                    else {
                        console.log('Successfully added User Settings Fixtures');
                        return done(true);
                    }
                });
            }
        });
    });
};

module.exports.drop = function (db, done) {
    db.on('connect', function (err) {
        db.driver.execQuery('DROP TABLE users', function (err) {
            if (err) {
                console.log('ERROR DROPPING USER TABLE: ' + err);
                return done(false);
            }
            else {
                console.log('Successfully dropped User table');
                db.driver.execQuery('DROP TABLE users_settings', function (err) {
                    if (err) {
                        console.log('ERROR DROP USERS_SETTINGS TABLE: ' + err);
                        return done(false);
                    }
                    else {
                        console.log('Successfully dropped Users_Settings table');
                        return done(true);
                    }
                });
            }
        });
    });
};


