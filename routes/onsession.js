var express = require('express');
var router = express.Router();

var Users = require('../modules/Users');

router.get('/onsession', (req, res, next) => {
    console.log(req.session.user, '#####', req.cookies.user);

    if (req.session.user || req.cookies.user) {

        console.log('session')

        if (!req.session.user && req.cookies.user) {
            Users.createSession(req, res, next, req.cookies.user, () => {
                res.send(JSON.stringify({status: true, user: req.session.user.name}));
            });
        } else

        if (!req.cookies.user && req.session.user) {
            console.log('session')
            Users.createSession(req, res, next, req.session.user, () => {
                res.send(JSON.stringify({status: true, user: req.session.user.name }));
            });
        } else

        if (req.cookies.user && req.session.user) {
            res.send(JSON.stringify({status: true, user: req.session.user.name}));
        }

    } else {
        Users.checkGuestSession(req, res);
        res.send(JSON.stringify({status: false}));
    }
});

module.exports = router;