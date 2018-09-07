var express = require('express');
var router = express.Router();

var qrs = require('querystring');
var URL = require('url');
var md5 = require('md5');

var Mongo = require('../modules/Mongo');
var User = require('../modules/Users');

router.post('/temp/save', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query),
        request = req.body,
        response = {
            status: false,
            message: 'Unexpected error',
            data: [],
            query: query,
            errors: [],
            log: {
                type: 'POST',
                path: '/temp/save',
                headers: req.headers
            }
        },
        user = User.checkSession(req, res, next) || User.checkGuestSession(req, res);

    if (user) {
        request.user = user.name;
        request.type = query.type || 'temporary';
        request.temp = md5(User.genSalt(12));

        Mongo.delete({ user: request.user, type: request.type }, 'temp', () => {
            Mongo.insert(request, 'temp', (response_db) => {
                response.status = true;
                response.message = "Temporary data saved";
                response.data = request;

                res.send(response);
            });
        });
    } else {
        response.status = false;
        response.message = "User didn't log";

        res.send(response);
    }
});

router.get('/temp/load', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query),
        response = {
            status: false,
            message: 'Unexpected error',
            data: [],
            query: query,
            errors: [],
            log: {
                type: 'GET',
                path: '/temp/load',
                headers: req.headers
            }
        },
        user = User.checkSession(req, res, next) || User.checkGuestSession(req, res);

    if (user) {
        Mongo.select({ user: user.name, temp: query.temp }, 'temp', (response_db) => {
            const temp = response_db[0];

            if (temp) {
                response.statusa = true;
                response.message = "Saves loaded";
                response.data = temp;

                res.send(response);
            } else {
                response.statusa = false;
                response.message = "Nothing saved";

                res.send(response);
            }
        });
    } else {
        response.statusa = false;
        response.message = "User didn't log";

        res.send(response);
    }
});

module.exports = router;