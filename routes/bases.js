var express = require('express');
var router = express.Router();

var Mongo = require('../modules/Mongo');

router.get('/bases', (req, res, next) => {
    Mongo.select({}, 'bases', (data) => {
        res.send(JSON.stringify(data));
    });
});

module.exports = router;
