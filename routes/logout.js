var express = require('express');
var router = express.Router();

var Users = require('../modules/Users');

router.get('/logout', (req, res, next) => {
    Users.closeSession(req, res, (err) => {
        if (err) console.log(err);
        res.redirect('/');
    });
});

module.exports = router;