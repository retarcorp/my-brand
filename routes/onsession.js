var express = require('express');
var router = express.Router();

var Users = require('../modules/Users');

router.get('/onsession', (req, res, next) => {
    let user = null;

    if ((user = Users.checkSession(req, res, next))) {
        console.log('after checkSession');
        Users.checkUserInDB(user, (isExist) => {
            console.log('after isExist');
            isExist ? res.send({status: true, user: req.session.user.name}) : res.send({status: false}) || Users.checkGuestSession(req, res);
        });
    } else {
        Users.checkGuestSession(req, res);
        res.send({status: false});
    }
});

module.exports = router;