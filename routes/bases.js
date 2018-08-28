var express = require('express');
var URL = require('url');
var qrs = require('querystring');

var router = express.Router();

var Mongo = require('../modules/Mongo');
var User = require('../modules/Users');

// router.get('/bases', (req, res, next) => {
//
//     let data = qrs.parse(URL.parse(req.url).query);
//
//     console.log('SISTER');
//
//     let page = parseInt(data.page) || data.page || 1,
//         resp = {},
//         bases = [],
//         pages = 1;
//
//     console.log('SISTER');
//
//
//     Mongo.select({}, 'bases', (data) => {
//
//         console.log(data);
//
//         if (!page && page != 'all') {
//             bases = data.filter( (base, index) => {
//                 if (index >= (page - 1)*20 && index < page * 20) {
//                     return true;
//                 }
//             });
//         } else {
//             bases = data;
//         }
//
//         pages = Math.ceil(data.length/20);
//
//         bases.reverse();
//
//         resp.bases = bases;
//         resp.pages = pages;
//
//         console.log(resp.pages);
//
//         res.send(JSON.stringify(resp));
//     });
// });

router.get('/bases', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query),
        response = {
            status: false,
            message: 'Unexpected error',
            data: [],
            query: query,
            errors: [],
            pages: 0,
            log: {
                type: 'GET',
                path: '/bases',
                headers: req.headers
            }
        },
        user = User.checkSession(req, res,next);

    Mongo.select({}, 'bases', (response_db) => {
        const bases = response_db;

        if (!query.page || query.page == 'all') {
            response.bases = bases;
            response.status = true;
            response.message = "All bases loaded";
            response.pages = Math.ceil(bases.length/query.amount);

            res.send(response);
            return;
        }

        query.page = parseInt(query.page);
        query.amount = query.amount || 20;

        response.bases = bases.filter( (base, index) => {
            if ( index >= (query.page - 1) * query.amount && index < query.page * query.amount) {
                return base;
            }
        });

        response.status = true;
        response.message = "Bases loaded";
        response.pages = Math.ceil(bases.length/query.amount);

        res.send(response);
    });
});

module.exports = router;
