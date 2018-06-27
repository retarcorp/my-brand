var express = require('express');
var router = express.Router();

var Users = require('../modules/Users');

router.get('/onsession', (req, res, next) => {
    console.log(req.session.user, '#####', req.cookies.user);

    if (req.session.user || req.cookies.user) {

        console.log('session')

        if (!req.session.user && req.cookies.user) {
            Users.createSession(req, res, next, req.cookies.user, () => {
                res.send(JSON.stringify({online: true}));
            });
        }

        if (!req.cookies.user && req.session.user) {
            console.log('session')
            Users.createSession(req, res, next, req.session.user, () => {
                res.send(JSON.stringify({online: true}));
            });
        }

        if (req.cookies.user && req.session.user) {
            res.send(JSON.stringify({online: true}));
        }

    } else {
        res.send(JSON.stringify({online: false}));
    }
});

module.exports = router;