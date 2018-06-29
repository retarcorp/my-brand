var express = require('express');
var router = express.Router();

var Users = require('../modules/Users');

router.get('/logout', (req, res, next) => {
    Users.closeSession(req, () => {
        res.send(JSON.stringify({status: true}));
    });
});

module.exports = router;