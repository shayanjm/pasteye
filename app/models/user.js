module.exports = function (db, cb) {
	// User Model
	var bcrypt = require('bcrypt');
	var crypto = require('crypto');
	var User = db.define('users', {
		username: { type: "text", unique: true, required: true },
		password: { type: "text", required: true },
		userEmail: { type: "text", unique: true, required: true },
		apikey: { type: "text", unique: true },
		access: { type: "number", required: true, defaultValue: 0 },
        activated: { type: "boolean", required: true, defaultValue: false }
	}, {
		methods : {
			authenticate: function (candidatePassword) {
				var _this = this;
				return bcrypt.compareSync(candidatePassword, _this.getPassword());
			},

			getPassword: function () {
				return this.password;
			},

			setPassword: function (newPassword) {
				this.password = newPassword;

			},

			getApiKey: function () {
				return this.apikey;
			},

			setApiKey: function (apikey) {
				this.apikey = apikey;
			},

            getId: function () {
                return this.id;
            },

            getUsername: function () {
                return this.username;
            },

			isAdmin: function () {
				if (this.access > 0) {
					return true;
				}
				else {
					return false;
				}
			},

            isActivated: function () {
                return this.activated;
            },

			getAccess: function () {
				return this.access
			},

			setAccess: function (newAccess, cb) {
				if (newAccess >= 0 && newAccess <= 3 ) {
					this.access = newAccess;
					cb(newAccess);
				}
				else {
					cb(null);
				}
			}
		},
		hooks : {
			beforeCreate: function (next) {
				var _this = this;
				var salt = bcrypt.genSaltSync(10);
				var apikey = crypto.randomBytes(50);
				var __this = bcrypt.hashSync(_this.getPassword(), salt);
				if (undefined !== __this) {
					this.setApiKey(apikey.toString('base64'));
					this.setPassword(__this);
					return next();
				}
			},

            beforeSave: function (next) {
                var salt = bcrypt.genSaltSync(10);
                // Get current hashed password from database
                // Create the function here and bind to this scope:
                func = (function (err, data) {
                    // Check if current hashed password isn't the same as this.password
                    if (err) {
                        return err;
                    }
                    else if (data === undefined) {
                        return next();
                    }
                    else {
                        if (data.length !== 0) {
                            var dbPassword = data[0].password;
                            if (this.getPassword() === dbPassword) {
                                // Check to see if the loaded password is exactly the same as the password stored in the db
                                return next();
                            }
                            else if (bcrypt.compareSync(this.getPassword(), dbPassword) === false) {
                                // Otherwise if it doesn't decrypt to be the same, we re-hash and save
                                this.setPassword(bcrypt.hashSync(this.getPassword(), salt));
                                return next();
                            }
                            else {
                                // Re-set this.password to be the same as dbPassword for the sake of consistency
                                // User.password should not be plaintext outside of the hook functions
                                this.password = dbPassword;
                                return next();
                            }
                        }
                        else {
                            return next();
                        }
                    }
                }).bind(this);
                console.log('Getting current password for user ' + this.id);
                db.driver.execQuery('SELECT password FROM users WHERE id = ' + this.id, func);
            },

			afterSave: function (next) {
				db.emit('userSave');
			}
		}
	});

	// User Settings extend model
	var UserSettings = User.extendsTo('settings', {
		ip: Number,
		email: Number,
		hash: Number
	});

    var UserStats = User.extendsTo('stats', {
        ip: { type: "number", required: true, defaultValue: 0 },
        email: { type: "number", required: true, defaultValue: 0 },
        hash: { type: "number", required: true, defaultValue: 0 }
    });
    // User Stats extend model

	// Create User Table
	User.sync(function (err) {
		if (err) {
			console.log('Error with saving User model: ' + err);
            db.emit('userSync');
		}
		else {
			console.log('Successfully saved User model');
            db.emit('userSync');
		}
	});

	// Create UserSettings Extend table
	UserSettings.sync(function (err) {
		if (err) {
			console.log('Error with saving UserSettings model: ' + err);
		}
		else {
			console.log('Successfully saved UserSettings model');
		}
	});

    UserStats.sync(function (err) {
        if (err) {
            console.log('Error with saving UserStats model: ' + err);
        }
        else {
            console.log('Successfully saved UserStats model');
        }
    });

return cb();
};
