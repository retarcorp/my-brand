var express = require('express');
var router = express.Router();

var Mongo = require('../modules/Mongo');

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
    Mongo.select( {}, 'admin', (data) => {
        const query = qrs.parse(URL.parse(req.url).query);
        let templates = [],
            pages = 0,
            response = {};

        console.log(query)

        if(query.page != 'all') {
            templates = data.filter( (project, index) => {
                if ((parseInt(query.page) - 1) * 20 <= index && parseInt(query.page) * 20 > index) {
                    return project;
                }
            });
        } else {
            templates = data;
        }

        response.status = true;
        response.pages = Math.ceil(data.length/20);
        response.messasge = 'Templates loaded';
        response.data = templates;

        res.send(response);
    });
});

module.exports = router;