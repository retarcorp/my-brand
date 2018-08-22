var express = require('express');
var router = express.Router();

var Mongo = require('../modules/Mongo');
var User = require('../modules/Users');

var qrs = require('querystring');
var URL = require('url');

router.post('/find/template/by/tag', (req, res, next) => {
    let parse = "";

    req.on('data', (data) => {
        parse+=data;
    });

    req.on('end', (err) => {
        if (err) console.error(err);

        console.log(parse);

        const data = JSON.parse(parse),
            response = {
                status: false
                ,message: "Error occurred"
                ,data: []
                ,request: data
            };

        if (data.length) {
            const tags = data;

            response.status = true;

            Mongo.select({}, 'admin', (response_db) => {
                let templates = response_db;

                templates.variants
            });

        } else {
            response.status = false;
            response.message = "No Tags presented in request";
            response.data = [];

            res.send(response);
        }
    })
});

router.get('/find/font/by/name', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query),
        response = {
            status: false,
            message: 'Unexpected error',
            data: [],
            query: query,
            errors: [],
            log: {
                type: 'GET',
                path: '/find/font/by/name',
                headers: req.headers
            }
        },
        user = User.checkSession(req, res, next);

    Mongo.select({ font: query.font }, 'fonts', (response_db) => {
        const font = response_db[0];

        if (font){
            response.status = true;
            response.message = 'Font loaded';
            response.data = font;

            res.send(response);
        } else {
            response.status = false;
            response.message = "Font didn't found";

            res.send(response);
        }
    });
});

router.post('/find/prints/by/tags', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query),
        request = req.body,
        response = {
            status: false,
            message: "Unexpected error",
            data: [],
            query: query,
            errors: [],
            request: request,
            log: {
                type: 'POST',
                path: '/find/prints/by/tags',
                headers: req.headers
            }
        },
        user = User.checkSession(req, res,next);

    Mongo.select({}, 'prints', (response_db) => {
        const prints = response_db,
            tags = request.tags,
            filter = (tags.length) ? prints.filter( print => {
                const pTags = print.tags,
                    fTags = pTags.filter( pTag => {
                        return tags.find( tag => pTag == tag);
                    }),
                    relevation = fTags.length;

                if(relevation) {
                    print.relevation = relevation;
                    return print;
                } else {
                    return false;
                }
            }) : prints;

        filter.sort( (pA, pB) => {
            return pB - pA;
        });

        response.data = filter;
        response.status = true;
        response.message = "Prints filtered, sorted and loaded";

        res.send(response);
    });
});

module.exports = router;
