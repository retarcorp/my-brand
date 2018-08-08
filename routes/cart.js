var express = require('express');
var router = express.Router();

var Mongo = require('../modules/Mongo');
var ObjectId = require('mongodb').ObjectID;
var User = require('../modules/Users');

var md5 = require('md5');
var URL = require('url');
var qrs = require('querystring');

router.post('/cart/add', (req, res, next) => {
    let parse = "";

    req.on('data', (data) => {
        parse+=data;
    });

    req.on('end', (err) => {
        if (err) {
            console.error(err);
        }

        const data = JSON.parse(parse),
            response = {
                status: false,
                message: "Unexpected error",
                data: data
            },
            user = req.cookies.user.name || req.session.user.name;

        Mongo.select({ id: data.id }, 'uniq', (response_db) => {
            if (response_db.length) {
                const project = response_db[0];

                project.cart_id = (project.cart_id) ? project.cart_id :  md5(User.genSalt(12));

                Mongo.update( { id: project.id }, project, 'uniq');
                Mongo.update( { cart_id: project.cart_id }, project, 'cart', (response_db) => {
                    console.log('Cart updated');

                    response.status = true;
                    response.message = "Cart updated";
                    response.data = project;

                    res.send(response);
                });
            } else {
                response.status = true;
                response.message = "No projects found";

                res.send(response);
            }

        });


    })
});

router.get('/cart/load', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query),
        response = {
            status: false,
            message: 'Unexpected error',
            query: query,
            data: [],
            errors: [],
            log: {
                type: 'GET',
                path: '/cart/load',
                headers: req.headers
            }
        };

    let user = User.checkSession(req, res, next);

    if (user) {
        Mongo.select({ user: user.name }, 'cart', (response_db) => {
            const cart = response_db;

            if (query.page && query.page != 'all') {
                query.page = parseInt(query.page);

                response.data = cart.filter( (item, index) => {
                    if (index >= (query.page - 1) * 10 && index < query.page * 10) {
                        return item;
                    }
                });
            } else {
                response.data = cart;
                console.log(cart, user);
            }
            response.status = true;
            response.message = "Cart loaded";
            response.pages = Math.ceil(cart/10);

            res.send(response);
        });

    } else {
        response.status = false;
        response.message = "User didn't logged";
        res.send(response);
    }


});

module.exports = router;