var express = require('express');
var router = express.Router();

var Mongo = require('../modules/Mongo');
var ErrorHandler = require('../modules/ErrorHandler');

var URL = require('url');
var qrs = require('querystring');
var fs = require('fs');

router.get('/load', function(req, res, next) {
    // let data = qrs.parse(URL.parse(req.url).query);

    if (req.cookies.user) {
        let user = req.cookies.user.name || req.session.user.name,
            key = { user: user },
            query = qrs.parse(URL.parse(req.url).query);

        Mongo.select(key, 'uniq', (data) => {
            let id = 0,
                page = query.page,
                bases = [];

            console.log(query);

            if (page == 'all') {
                bases = data.map( (proj, index) => {
                    if (proj.id > id) id = proj.id;
                    return proj;
                });
            } else {
                page = parseInt(page);

                bases = data.filter( (proj, index) => {
                    if (proj.id > id) id = proj.id;

                    if (index >= (page - 1) * 20 && index < page * 20) {
                        return proj;
                    }
                });
            }

            bases.reverse();

            const pages = Math.ceil(data.length / 20);
            res.send( { projects: bases, last_id: id, pages: pages });
        });

    } else res.send([]);

});

router.get('/load/templates', (req, res, next) => {
    const user = req.cookies.user.name || req.session.user.name; ////WORKFLOW
    const query = qrs.parse(URL.parse(req.url).query);

    console.log(query);

    Mongo.select( { "base._id" : query._id }, 'admin', (data) => {
        let templates = data,
            pages = 0,
            response = {};

        if (query.page || query.page != 'all') {
            query.page = parseInt(query.page);

            response.data = templates.filter( (t, index) => {
                if (index >= 20 * (query.page - 1) && index < 20 * query.page) {
                    return t;
                }
            });
        } else {
            response.data = templates;
        }

        response.status = true;
        response.pages = Math.ceil(data.length/20);
        response.messasge = 'Templates loaded';

        res.send(response);
    });
});

router.get('/load/prints', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query),
        response = {
            status: false,
            message: "Unexpected error",
            data: null,
            query: query,
            errors: [],
            logs: {
                type: 'GET',
                path: '/load/prints',
                headers: req.headers
            }
        };

    Mongo.select( {}, 'prints', (response_db) => {
        const prints = response_db;

        if (prints.length) {

            if (query.page && query.page != 'all') {
                query.page = parseInt(query.page);

                response.data = prints.filter((print, index) => {
                    if (index >= (query.page - 1) * 32 && index < query.page * 32) {
                        return print;
                    }
                });
            } else {
                response.data = prints;
            }

            response.data.reverse();

            response.status = true;
            response.message = 'Data loaded';
            response.pages = Math.ceil(prints.length/32);

            res.send(response);

        } else {
            response.message = "No data found";
            response.errors.push(ErrorHandler.generateError('noData', { options: null }));

            res.send(response);
        }
    });
});

module.exports = router;