var request = require('supertest');
var expect = require('chai').expect;
var config = require('../../../config');

// Sanity Check first
describe('Sanity Check', function () {
    it('Should equal 2', function (done) {
        var n = 1;
        expect(n + n).to.equal(2);
        done();
    });
});

// Verify that the API is alive
describe('Check if alive via GET /api', function () {
    it('respond with a heartbeat', function (done){
        request('http://localhost:3000')
            .get('/api')
            .set('Accept', 'application/json')
            .expect('Pasteye API is running!')
            .end(function(err, res){
                if(err) return done(err);
                done();
            });
    });
});

/*
 * User Authentication Tests
 */

/* LOGIN */
// CASES: Successful Login, Unsuccessful Login
describe('Successful User Login via POST /login', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .post('/login')
            .send({username: 'ShayanTest90', password: 'ShayanTest10'})
            .set('Content-Type', 'application/json')
            .expect('Success! ShayanTest90', done)
    });
});

describe ('Unsuccessful User Login via POST /login', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .post('/login')
            .send({username: 'False', password: 'False'})
            .set('Content-Type', 'application/json')
            .expect('Unauthorized', done)
    });
});

/* LOGOUT */
// CASES: Successful Logout
describe('Successful User Logout via GET /logout', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .get('/logout')
            .set('Accept', 'application/json')
            .expect('You have successfully signed out.', done);
    });
});



/*
 * User CRUD tests
 */

/* GET Users */
// CASES:
// -> GET all users: Successful, Unsuccessful due to non-admin, Unsuccessful due to bad API key, Unsuccessful due to no API key
// -> GET user by ID: Successful, Unsuccessful due to non-admin, Unsuccessful due to bad API key, Unsuccessful due to no API key
// -> GET user settings by ID: Successful, Unsuccessful due to non-admin, Unsuccessful due to bad API key, Unsuccessful due to no API key
describe('Successful ALL User listing via GET /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .get('/api/users')
            .send({apikey: 'edQqQkLQN9eOu0t0J3GvRJWrOkRFe5e34lzElmJ7ofWmoC3xAL+eh0b8+sJQkp+jBdY='})
            .set('Accept', 'application/json')
            .expect(200, done)
    });
});

describe('Unsuccessful ALL User listing due to non-admin via GET /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .get('/api/users')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o='})
            .set('Accept', 'application/json')
            .expect(401, done)
    });
});

describe('Unsuccessful ALL User listing due to bad API key via GET /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .get('/api/users')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o'})
            .set('Accept', 'application/json')
            .expect(500, done)
    });
});

describe('Unsuccessful ALL User listing due to no API key via GET /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .get('/api/users')
            .set('Accept', 'application/json')
            .expect(400, done)
    });
});

describe('Successful individual User listing via GET /api/users/:id', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
        .get('/api/users/1')
        .send({apikey: 'edQqQkLQN9eOu0t0J3GvRJWrOkRFe5e34lzElmJ7ofWmoC3xAL+eh0b8+sJQkp+jBdY='})
            .set('Accept', 'application/json')
            .expect(200, done)
    });
});

describe('Unsuccessful individual User listing due to non-admin via GET /api/users/:id', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .get('/api/users/1')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o='})
            .set('Accept', 'application/json')
            .expect(401, done)
    });
});

describe('Unsuccessful individual User listing due to bad API key via GET /api/users/:id', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .get('/api/users/1')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o'})
            .set('Accept', 'application/json')
            .expect(500, done)
    });
});

describe('Unsuccessful individual User listing due to no API key via GET /api/users/:id', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .get('/api/users/1')
            .set('Accept', 'application/json')
            .expect(400, done)
    });
});

describe('Successful individual User settings listing via GET /api/users/:id/settings', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
        .get('/api/users/1/settings')
        .send({apikey: 'edQqQkLQN9eOu0t0J3GvRJWrOkRFe5e34lzElmJ7ofWmoC3xAL+eh0b8+sJQkp+jBdY='})
            .set('Accept', 'application/json')
            .expect(200, done)
    });
});

describe('Unsuccessful individual User settings listing due to non-admin via GET /api/users/:id/settings', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .get('/api/users/1/settings')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o='})
            .set('Accept', 'application/json')
            .expect(401, done)
    });
});

describe('Unsuccessful individual User settings listing due to bad API key via GET /api/users/:id/settings', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .get('/api/users/1/settings')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o'})
            .set('Accept', 'application/json')
            .expect(500, done)
    });
});

describe('Unsuccessful individual User settings listing due to no API key via GET /api/users/:id/settings', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .get('/api/users/1/settings')
            .set('Accept', 'application/json')
            .expect(400, done)
    });
});

/* POST Users */
// CASES:
// -> POST an array of Users with settings: Successful, Unsuccessful due to non-admin, Unsuccessful due to bad API key, Unsuccessful due to no API key
// -> POST an array of Users without settings: Successful, Unsuccessful due to non-admin, Unsuccessful due to bad API key, Unsuccessful due to no API key
// -> POST a single User with settings: Successful, Unsuccessful due to bad request
// -> POST a single User without settings: Successful, Unsuccessful due to bad request
describe('Successful Multi-User creation with settings via POST /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .post('/api/users')
            .send({apikey: 'edQqQkLQN9eOu0t0J3GvRJWrOkRFe5e34lzElmJ7ofWmoC3xAL+eh0b8+sJQkp+jBdY=', users: [{username: 'user1TestMultiSettings', password: 'user1TestMultiSettings', userEmail: 'user1TestMultiSettings@user1TestMultiSettings.user1TestMultiSettings', ip: 1, email: 1, hash: 1}, {username: 'user2TestMultiSettings', password: 'user2TestMultiSettings', userEmail: 'user2TestMultiSettings@user2TestMultiSettings.user2TestMultiSettings', ip: 1, email: 1, hash: 1}, {username: 'user3TestMultiSettings', password: 'user3TestMultiSettings', userEmail: 'user3TestMultiSettings@user3TestMultiSettings.user3TestMultiSettings', ip: 1, email: 1, hash: 1}] })
            .set('Accept', 'application/json')
            .expect(200, done)
    });
});

describe('Unsuccessful Multi-User creation with settings due to non-admin via POST /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .post('/api/users')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o=', users: [{username: 'user1TestMultiSettings', password: 'user1TestMultiSettings', userEmail: 'user1TestMultiSettings@user1TestMultiSettings.user1TestMultiSettings', ip: 1, email: 1, hash: 1}, {username: 'user2TestMultiSettings', password: 'user2TestMultiSettings', userEmail: 'user2TestMultiSettings@user2TestMultiSettings.user2TestMultiSettings', ip: 1, email: 1, hash: 1}, {username: 'user3TestMultiSettings', password: 'user3TestMultiSettings', userEmail: 'user3TestMultiSettings@user3TestMultiSettings.user3TestMultiSettings', ip: 1, email: 1, hash: 1}] })
            .set('Accept', 'application/json')
            .expect(401, done)
    });
});

describe('Unsuccessful Multi-User creation with settings due to bad API key via POST /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .post('/api/users')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o', users: [{username: 'user1TestMultiSettings', password: 'user1TestMultiSettings', userEmail: 'user1TestMultiSettings@user1TestMultiSettings.user1TestMultiSettings', ip: 1, email: 1, hash: 1}, {username: 'user2TestMultiSettings', password: 'user2TestMultiSettings', userEmail: 'user2TestMultiSettings@user2TestMultiSettings.user2TestMultiSettings', ip: 1, email: 1, hash: 1}, {username: 'user3TestMultiSettings', password: 'user3TestMultiSettings', userEmail: 'user3TestMultiSettings@user3TestMultiSettings.user3TestMultiSettings', ip: 1, email: 1, hash: 1}] })
            .set('Accept', 'application/json')
            .expect(500, done)
    });
});

describe('Unsuccessful Multi-User creation with settings due to no API key via POST /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .post('/api/users')
            .send({users: [{username: 'user1TestMultiSettings', password: 'user1TestMultiSettings', userEmail: 'user1TestMultiSettings@user1TestMultiSettings.user1TestMultiSettings', ip: 1, email: 1, hash: 1}, {username: 'user2TestMultiSettings', password: 'user2TestMultiSettings', userEmail: 'user2TestMultiSettings@user2TestMultiSettings.user2TestMultiSettings', ip: 1, email: 1, hash: 1}, {username: 'user3TestMultiSettings', password: 'user3TestMultiSettings', userEmail: 'user3TestMultiSettings@user3TestMultiSettings.user3TestMultiSettings', ip: 1, email: 1, hash: 1}] })
            .set('Accept', 'application/json')
            .expect(400, done)
    });
});

describe('Successful Multi-User creation without settings via POST /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .post('/api/users')
            .send({apikey: 'edQqQkLQN9eOu0t0J3GvRJWrOkRFe5e34lzElmJ7ofWmoC3xAL+eh0b8+sJQkp+jBdY=', users: [{username: 'user1TestMultiNoSettings', password: 'user1TestMultiNoSettings', userEmail: 'user1TestMultiNoSettings@user1TestMultiNoSettings.user1TestMultiNoSettings'}, {username: 'user2TestMultiNoSettings', password: 'user2TestMultiNoSettings', userEmail: 'user2TestMultiNoSettings@user2TestMultiNoSettings.user2TestMultiNoSettings'}, {username: 'user3TestMultiNoSettings', password: 'user3TestMultiNoSettings', userEmail: 'user3TestMultiNoSettings@user3TestMultiNoSettings.user3TestMultiNoSettings'}] })
            .set('Accept', 'application/json')
            .expect(200, done)
    });
});

describe('Unsuccessful Multi-User creation without settings due to non-admin via POST /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .post('/api/users')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o=', users: [{username: 'user1TestMultiNoSettings', password: 'user1TestMultiNoSettings', userEmail: 'user1TestMultiNoSettings@user1TestMultiNoSettings.user1TestMultiNoSettings'}, {username: 'user2TestMultiNoSettings', password: 'user2TestMultiNoSettings', userEmail: 'user2TestMultiNoSettings@user2TestMultiNoSettings.user2TestMultiNoSettings'}, {username: 'user3TestMultiNoSettings', password: 'user3TestMultiNoSettings', userEmail: 'user3TestMultiNoSettings@user3TestMultiNoSettings.user3TestMultiNoSettings'}] })
            .set('Accept', 'application/json')
            .expect(401, done)
    });
});

describe('Unsuccessful Multi-User creation without settings due to bad API key via POST /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .post('/api/users')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o', users: [{username: 'user1TestMultiNoSettings', password: 'user1TestMultiNoSettings', userEmail: 'user1TestMultiNoSettings@user1TestMultiNoSettings.user1TestMultiNoSettings'}, {username: 'user2TestMultiNoSettings', password: 'user2TestMultiNoSettings', userEmail: 'user2TestMultiNoSettings@user2TestMultiNoSettings.user2TestMultiNoSettings'}, {username: 'user3TestMultiNoSettings', password: 'user3TestMultiNoSettings', userEmail: 'user3TestMultiNoSettings@user3TestMultiNoSettings.user3TestMultiNoSettings'}] })
            .set('Accept', 'application/json')
            .expect(500, done)
    });
});

describe('Unsuccessful Multi-User creation without settings due to no API key via POST /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .post('/api/users')
            .send({users: [{username: 'user1TestMultiNoSettings', password: 'user1TestMultiNoSettings', userEmail: 'user1TestMultiNoSettings@user1TestMultiNoSettings.user1TestMultiNoSettings'}, {username: 'user2TestMultiNoSettings', password: 'user2TestMultiNoSettings', userEmail: 'user2TestMultiNoSettings@user2TestMultiNoSettings.user2TestMultiNoSettings'}, {username: 'user3TestMultiNoSettings', password: 'user3TestMultiNoSettings', userEmail: 'user3TestMultiNoSettings@user3TestMultiNoSettings.user3TestMultiNoSettings'}] })
            .set('Accept', 'application/json')
            .expect(400, done)
    });
});

describe('Successful Single-User creation with settings via POST /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .post('/api/users')
            .send({username: 'user1TestSettings', password: 'user1TestSettings', userEmail: 'user1TestSettings@user1TestSettings.user1TestSettings', ip: 1, email: 1, hash: 1})
            .set('Accept', 'application/json')
            .expect(200, done)
    });
});

describe('Unsuccessful Single-User creation with settings due to bad request via POST /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .post('/api/users')
            .send({notusername: 'user1TestSettings', password: 'user1TestSettings', userEmail: 'user1TestSettings@user1TestSettings.user1TestSettings', ip: 1, email: 1, hash: 1})
            .set('Accept', 'application/json')
            .expect(400, done)
    });
});

describe('Unsuccessful Single-User creation with settings due to existing user via POST /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .post('/api/users')
            .send({username: 'user1TestSettings', password: 'user1TestSettings', userEmail: 'user1TestSettings@user1TestSettings.user1TestSettings', ip: 1, email: 1, hash: 1})
            .set('Accept', 'application/json')
            .expect(500, done)
    });
});

describe('Successful Single-User creation without settings via POST /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .post('/api/users')
            .send({username: 'user1TestNoSettings', password: 'user1TestNoSettings', userEmail: 'user1TestNoSettings@user1TestNoSettings.user1TestNoSettings'})
            .set('Accept', 'application/json')
            .expect(200, done)
    });
});

describe('Unsuccessful Single-User creation without settings due to bad request via POST /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .post('/api/users')
            .send({notusername: 'user1TestNoSettings', password: 'user1TestNoSettings', userEmail: 'user1TestNoSettings@user1TestNoSettings.user1TestNoSettings'})
            .set('Accept', 'application/json')
            .expect(400, done)
    });
});

describe('Unsuccessful Single-User creation without settings due to existing user via POST /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .post('/api/users')
            .send({username: 'user1TestNoSettings', password: 'user1TestNoSettings', userEmail: 'user1TestNoSettings@user1TestNoSettings.user1TestNoSettings'})
            .set('Accept', 'application/json')
            .expect(500, done)
    });
});

/* PUT Users */
// CASES:
// -> Update Single User: Successful (Admin), Successful (User), Unsuccessful due to non-admin, Unsuccessful due to bad API key, Unsuccessful due to no API key
describe('Successful (ADMIN) Single-User update via PUT /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .put('/api/users/2')
            .send({apikey: 'edQqQkLQN9eOu0t0J3GvRJWrOkRFe5e34lzElmJ7ofWmoC3xAL+eh0b8+sJQkp+jBdY=', userEmail: 'Changed', ip: 3})
            .set('Accept', 'application/json')
            .expect(200, done)
    });
});


describe('Unsuccessful Single-User update due to non-admin via PUT /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .put('/api/users/1')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o=', userEmail: 'Changed2', ip: 2})
            .set('Accept', 'application/json')
            .expect(401, done)
    });
});

describe('Unsuccessful Single-User update due to bad API key via PUT /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .put('/api/users/1')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o', userEmail: 'Changed2', ip: 2})
            .set('Accept', 'application/json')
            .expect(500, done)
    });
});

describe('Unsuccessful Single-User update due to no API key via PUT /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .put('/api/users/1')
            .send({userEmail: 'Changed2', ip: 2})
            .set('Accept', 'application/json')
            .expect(400, done)
    });
});

describe('Successful (USER) Single-User update via PUT /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .put('/api/users/2')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o=', userEmail: 'Changed2', ip: 2})
            .set('Accept', 'application/json')
            .expect(200, done)
    });
});

/* DELETE Users */
// CASES:
// -> Delete Array of Users: Successful, Unsuccessful due to non-admin, Unsuccessful due to bad API key, Unsuccessful due to no API key
// -> Delete Single User With Settings: Successful (Admin), Successful (User), Unsuccessful due to non-admin, Unsuccessful due to bad API key, Unsuccessful due to no API key, Unsuccessful due to no User, Unsuccessful due to different User
// -> Delete Single User Without Settings: Successful (Admin), Successful (User), Unsuccessful due to non-admin, Unsuccessful due to bad API key, Unsuccessful due to no API key, Unsuccessful due to no User, Unsuccessful due to different User
describe('Successful Multi-User deletion with settings via DELETE /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({apikey: 'edQqQkLQN9eOu0t0J3GvRJWrOkRFe5e34lzElmJ7ofWmoC3xAL+eh0b8+sJQkp+jBdY=', users: [{username: 'user1TestMultiSettings'}, {username: 'user2TestMultiSettings'}, {username: 'user3TestMultiSettings'}]})
            .set('Accept', 'application/json')
            .expect(200, done)
    });
});

describe('Successful Multi-User deletion without settings via DELETE /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({apikey: 'edQqQkLQN9eOu0t0J3GvRJWrOkRFe5e34lzElmJ7ofWmoC3xAL+eh0b8+sJQkp+jBdY=', users: [{username: 'user1TestMultiNoSettings'}, {username: 'user2TestMultiNoSettings'}, {username: 'user3TestMultiNoSettings'}]})
            .set('Accept', 'application/json')
            .expect(200, done)
    });
});

describe('Unsuccessful Multi-User deletion due to non-admin via DELETE /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o=', users: [{username: 'user1TestMultiSettings'}, {username: 'user2TestMultiSettings'}, {username: 'user3TestMultiSettings'}, {username: 'user1TestMultiNoSettings'}, {username: 'user2TestMultiNoSettings'}, {username: 'user3TestMultiNoSettings'}]})
            .set('Accept', 'application/json')
            .expect(401, done)
    });
});

describe('Unsuccessful Multi-User deletion due to bad API key via DELETE /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o', users: [{username: 'user1TestMultiSettings'}, {username: 'user2TestMultiSettings'}, {username: 'user3TestMultiSettings'}, {username: 'user1TestMultiNoSettings'}, {username: 'user2TestMultiNoSettings'}, {username: 'user3TestMultiNoSettings'}]})
            .set('Accept', 'application/json')
            .expect(500, done)
    });
});

describe('Unsuccessful Multi-User deletion due to no API key via DELETE /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({users: [{username: 'user1TestMultiSettings'}, {username: 'user2TestMultiSettings'}, {username: 'user3TestMultiSettings'}, {username: 'user1TestMultiNoSettings'}, {username: 'user2TestMultiNoSettings'}, {username: 'user3TestMultiNoSettings'}]})
            .set('Accept', 'application/json')
            .expect(400, done)
    });
});

describe('Successful (ADMIN) Single-User deletion with settings via DELETE /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({apikey: 'edQqQkLQN9eOu0t0J3GvRJWrOkRFe5e34lzElmJ7ofWmoC3xAL+eh0b8+sJQkp+jBdY=', username: 'user1TestSettings'})
            .set('Accept', 'application/json')
            .expect(200, done)
    });
});


describe('Unsuccessful Single-User deletion with settings due to non-admin via DELETE /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o=', username: 'user1TestSettings'})
            .set('Accept', 'application/json')
            .expect(401, done)
    });
});

describe('Unsuccessful Single-User deletion with settings due to bad API key via DELETE /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o', username: 'user1TestSettings'})
            .set('Accept', 'application/json')
            .expect(500, done)
    });
});

describe('Unsuccessful Single-User deletion with settings due to no API key via DELETE /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({username: 'user1TestSettings'})
            .set('Accept', 'application/json')
            .expect(400, done)
    });
});


describe('Unsuccessful Single-User deletion with settings due to no User via DELETE /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({apikey: 'edQqQkLQN9eOu0t0J3GvRJWrOkRFe5e34lzElmJ7ofWmoC3xAL+eh0b8+sJQkp+jBdY=', username: 'user1TestSettingsNonExistant'})
            .set('Accept', 'application/json')
            .expect(500, done)
    });
});

describe('Successful (USER) Single-User deletion with settings via DELETE /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({apikey: 'jWfuC1oJ9HpvZN7GOl7CmlPYmOJF6PbgB3VmRckT/xkwukZuAqc9o/5wwhBMfsDzqVQ=', username: 'ShayanTest80'})
            .set('Accept', 'application/json')
            .expect(200, done)
    });
});

describe('Successful (ADMIN) Single-User deletion without settings via DELETE /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({apikey: 'edQqQkLQN9eOu0t0J3GvRJWrOkRFe5e34lzElmJ7ofWmoC3xAL+eh0b8+sJQkp+jBdY=', username: 'user1TestNoSettings'})
            .set('Accept', 'application/json')
            .expect(200, done)
    });
});

describe('Unsuccessful Single-User deletion without settings due to non-admin via DELETE /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o=', username: 'user1TestNoSettings'})
            .set('Accept', 'application/json')
            .expect(401, done)
    });
});

describe('Unsuccessful Single-User deletion without settings due to bad API key via DELETE /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({apikey: '/IUsz7Vgz9wGARZOaRew2oDNXCjwjGnaZpwUn2BD5DP3lzMtH1YRdlA5mIcWi1Euo7o', username: 'user1TestNoSettings'})
            .set('Accept', 'application/json')
            .expect(500, done)
    });
});

describe('Unsuccessful Single-User deletion without settings due to no API key via DELETE /api/users', function () {
    it('responded with failure', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({username: 'user1TestNoSettings'})
            .set('Accept', 'application/json')
            .expect(400, done)
    });
});

describe('Unsuccessful Single-User deletion without settings due to no User via DELETE /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({apikey: 'edQqQkLQN9eOu0t0J3GvRJWrOkRFe5e34lzElmJ7ofWmoC3xAL+eh0b8+sJQkp+jBdY=', username: 'user1TestNoSettingsNonExistant'})
            .set('Accept', 'application/json')
            .expect(500, done)
    });
});

describe('Successful (USER) Single-User deletion without settings via DELETE /api/users', function () {
    it('responded with success', function (done) {
        request('http://localhost:3000')
            .del('/api/users')
            .send({apikey: '6fpg0gFAJuGstfG4/tQA6QGMsqBsVBKe6l0TYuf4IxHQXzPeWpi4ERVniM2N4c4v1bs=', username: 'ShayanTest60'})
            .set('Accept', 'application/json')
            .expect(200, done)
    });
});
