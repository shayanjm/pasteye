
/*
 * GET home page.
 */

exports.beta = function (req, res) {
    res.render('beta');
};

exports.signup = function (req, res) {
    res.render('signup');
};

exports.verifyEmail = function (req, res) {
    res.render('verifyEmail');
};

exports.resendEmail = function (req, res) {
    res.render('resendEmail');
};

exports.forgotPassword = function (req, res) {
    res.render('forgotPassword');
};

exports.resetPassword = function (req, res) {
    res.render('resetPassword');
};

exports.verifyUser = function (req, res) {
    res.render('verifyUser');
};
