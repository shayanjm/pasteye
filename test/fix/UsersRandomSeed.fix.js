var request = require('supertest');

var uniqueId = 345;
setInterval(function () {
    request('http://localhost:3000')
            .post('/api/users')
            .send({username: 'ShayanTest' + uniqueId, password: 'ShayanTest10', userEmail: 'ShayanTest' + uniqueId + '@ShayanTest' + uniqueId + '.ShayanTest' + uniqueId, ip: Math.floor(Math.random() * 15) + 1, email: Math.floor(Math.random() * 15) + 1, hash: Math.floor(Math.random() * 15) + 1})
            .set('Accept', 'application/json')
            .end(function(err, res){
                if (err) {
                    console.log('ERROR! ' + err);
                }
                else {
                    console.log('Successfully posted for user ShayanTest' + uniqueId);
                }
            });
uniqueId += 1;
}, 250);
