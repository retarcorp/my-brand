var express = require('express');
var router = express.Router();

var Mongo = require('../modules/Mongo');
var User = require('../modules/Users');

var qrs = require('querystring');
var URL = require('url');

router.post('/log/add', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query),
        request = req.body,
        user = User.checkSession(req, res, next);

    request && (request.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress);

    Mongo.insert(request, 'logs', (response_db) => {
        res.send(true);
    });
});

module.exports = router;