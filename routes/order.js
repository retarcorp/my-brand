var express = require('express');
var router = express.Router();

var Mongo = require('../modules/Mongo');
var User = require('../modules/Users');

var URL = require('url');
var qrs = require('querystring');

router.post('/order/set', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query);
    let parse = "";

    req.on('data', (data) => {
        parse+=data;
    });

    req.on('end', (err) => {
        if (err) console.log(err);

        const data = qrs.parse(parse),
            response = {
                status: false,
                message: "Unexpected error",
                data: data,
                query: query
            },
            user = User.checkSession(req, res, next);

        if (user) {
            Mongo.select({ user: user.name }, 'cart', (response_db) => {
                const cart = response_db,
                    order = {};

                if (cart.length) {
                    order.cart = cart;
                    order.user = user.name;
                    order.info = data;
                    order.staus = 'В обработке';

                    Mongo.count({ user: user.name }, 'order', (response_db) => {
                        order.number = response_db;

                        Mongo.delete( { user: user.name }, 'cart', (response_db) => {
                            console.log('Cart emptied');
                        });

                        Mongo.insert( order, 'order', (response_db) => {
                            response.status = true;
                            response.message = "Order created";

                            res.send(response);
                        });
                    });

                } else {
                    response.status = false;
                    response.message = "No user products cart found"

                    res.send(response);
                }

            });
        } else {
            response.status = false;
            response.message = "User didn't logged"

            res.send(response);
        }

    });
});

router.get('/order/load', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query),
        response = {
            status: false,
            message: 'Unexpected error',
            data: [],
            query: query,
            errors: [],
            log: {
                type: 'GET',
                path: '/order/load',
                headers: req.headers
            }
        },
        user = User.checkSession(req, res, next);

    if (user && user.admin) {
        Mongo.select({}, 'order', (response_db) => {
            const orders = response_db;

            if (query.page && !query.page != 'all') {
                query.page = parseInt(query.page);

                response.data = orders.filter( (o, index) => {
                    if (index >= (query.page - 1) * 20 && index < query.page * 20) {
                        return o;
                    }
                });

            } else {
                response.data = orders;
            }

            response.status = true;
            response.message = 'Orders loaded';

            res.send(response);
        });
    } else {
        response.status = false;
        response.message = "User don't have right rules";

        res.send(response);
    }
});

router.post('/order/update', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query),
        request = req.body,
        response = {
            status: false,
            message: 'Unexpected error',
            data: [],
            errors: [],
            query: query,
            request: request,
            log: {
                type: 'POST',
                path: '/order/update',
                headers: req.headers
            }
        },
        user = User.checkSession(req, res, next);

    if (user && user.admin) {
        Mongo.update({ _id: Mongo.toObjectId(query._id) }, { info: request }, 'order', (response_db) => {
            response.status = true;
            response.message = 'Order updated';

            res.send(response);
        });
    } else {
        response.status = false;
        response.message = "User didn't log";

        res.send(response);
    }
});

module.exports = router;