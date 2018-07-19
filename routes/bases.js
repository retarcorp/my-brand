var express = require('express');
var URL = require('url');
var qrs = require('querystring');

var router = express.Router();

var Mongo = require('../modules/Mongo');

router.get('/bases', (req, res, next) => {

    let data = qrs.parse(URL.parse(req.url).query);

    console.log('SISTER');

    let page = parseInt(data.page) || data.page || 1,
        resp = {},
        bases = [],
        pages = 1;

    console.log('SISTER');


    Mongo.select({}, 'bases', (data) => {

        console.log(data);

        if (page != 'all') {
            bases = data.filter( (base, index) => {
                if (index >= (page - 1)*20 && index < page * 20) {
                    return true;
                }
            });
        } else {
            bases = data;
        }

        pages = Math.ceil(data.length/20);

        bases.reverse();

        resp.bases = bases;
        resp.pages = pages;

        console.log(resp.pages);

        res.send(JSON.stringify(resp));
    });
});

module.exports = router;
