app.factory('CurrentUser', function (Restangular) {
    return {
        current: Restangular.one('user', 'me')
    }
});
