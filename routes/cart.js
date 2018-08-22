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

        Mongo.select({ id: data.id, user: user }, 'uniq', (response_db) => {
            if (response_db.length) {
                const project = response_db[0];

                response.subdata = (project.cart_id) ? false : true;
                project.cart_id = (project.cart_id) ? project.cart_id :  md5(User.genSalt(12));

                //delete project._id;

                Mongo.update( { id: project.id, user: project.user }, project, 'uniq', () => {
                    console.log(project.cart_id, project._id);

                    Mongo.update( { cart_id: project.cart_id }, project, 'cart', (response_db) => {
                        console.log('Cart updated');

                        response.status = true;
                        response.message = "Cart updated";
                        response.data = project;

                        res.send(response);
                    });
                });

            } else {
                response.status = true;
                response.message = "No projects found";

                res.send(response);
            }

        });
    })
});

router.post('/cart/add/product', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query),
        request = req.body,
        response = {
            status: false,
            substatus: '',
            message: 'Unexpected error',
            query: query,
            data: [],
            errors: [],
            log: {
                type: 'GET',
                path: '/cart/load',
                headers: req.headers
            }
        },
        user = User.checkSession(req, res, next);

    if (!user) {
        response.status = false;
        response.message = "User didn't logged";

        res.send(response);
    }

    const project = request;
    project.user = user.name;
    project._id && delete project._id;

    Mongo.select({ user: user.name, id: project.id }, 'cart', (response_db) => {
        const cart = response_db;
        const items = cart.filter( item => item.user == project.user);

        if (!items.length) {
            project.cart_id = md5(User.genSalt(12));
            project.amount = 1;

            Mongo.insert(project, 'cart', () => {
                response.status = true;
                response.substatus = "SAVED_NEW";
                response.message = 'Inserted to cart';

                res.send(response);
            });

            return;
        }

        const buffer = JSON.parse(JSON.stringify(project));
        let cart_id = "",
            amount = 0;

        buffer._id && delete buffer._id;
        buffer.cart_id && delete buffer.cart_id;
        buffer.templates && delete buffer.templates;
        buffer.user && delete buffer.user;
        buffer.id && delete buffer.id;

        const search = items.find( item => {
            cart_id = item.cart_id;
            amount = item.amount;

            item._id && delete item._id;
            item.cart_id && delete item.cart_id;
            item.amount && delete item.amount;
            item.templates && delete item.templates;
            item.user && delete item.user;
            item.id && delete item.id;

            return User.checkHash(buffer, item);
        });

        if (!search) {
            project.cart_id = md5(User.genSalt(12));
            project.amount = 1;

            Mongo.insert(project, 'cart', () => {
                response.status = true;
                response.substatus = "SAVED_NEW";
                response.message = 'Inserted to cart';

                res.send(response);
            });

            return;
        }

        project.cart_id = cart_id;
        project.amount = (amount) ? amount + 1 : 1;

        Mongo.update({ cart_id: cart_id }, project, 'cart', () => {
            response.status = true;
            response.substatus = "UPDATED";
            response.message = 'Cart updated';

            res.send(response);
        });
    });
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

router.get('/cart/amount', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query),
        response = {
            status: false,
            message: 'Unexpected error',
            data: [],
            query: query,
            errors: [],
            log: {
                type: 'GET',
                path: '/cart/amount',
                headers: req.headers
            }
        },
        user = User.checkSession(req, res, next);

    if (user) {
        Mongo.select({ user: user.name }, 'cart', (response_db) => {
            const cart = response_db;

            response.status = true;
            response.message = 'Cart counted';
            response.data = cart.length;

            res.send(response);
        });
    } else {
        response.status = false;
        response.message = "User didn't logged";

        res.send(response);
    }
});

module.exports = router;