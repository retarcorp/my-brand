var express = require('express');
var router = express.Router();

var Mongo = require('../modules/Mongo');
var User = require('../modules/Users');

var URL = require('url');
var qrs = require('querystring');

router.get('/myOrders', (req, res, next) => {
    res.sendFile('myOrders.html', { root: 'public/' });
});

router.get('/myOrders/load', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query),
        response = {
            status: false,
            message: "Unexpected error",
            data: [],
            query: query,
            errors: [],
            log: {
                type: 'GET',
                path: '/myOrders/load',
                headers: req.headers
            }
        },
        user = User.checkSession(req, res, next);

    if (user) {
        Mongo.select({ user: user.name }, 'order', (response_db) => {
            const orders = response_db;

            response.data = orders.map( o => {
                delete o.comment;

                return o;
            }).reverse();

            response.status = true;
            response.message = "Orders loaded";

            res.send(response);
        });
    } else {
        response.status = false;
        response.message = "User didn't logged";

        res.send(response);
    }
});

router.post('/order/set', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query);
    let parse = "";

    req.on('data', (data) => {
        parse+=data;
    });

    req.on('end', (err) => {
        if (err) console.log(err);

        const data = JSON.parse(parse),
            response = {
                status: false,
                message: "Unexpected error",
                data: data,
                query: query
            },
            user = User.checkSession(req, res, next);

        if (user) {
            // Mongo.select({ user: user.name }, 'cart', (response_db) => {
                const order = {};

                if (data.cart.length) {
                    order.cart = data.cart;
                    order.user = user.name;
                    order.info = data;
                    order.status = 'В обработке';

                    Mongo.count({}, 'order', (response_db) => {
                        order.number = response_db;

                        Mongo.delete( { user: user.name }, 'cart', (response_db) => {
                            console.log('Cart emptied');
                        });

                        Mongo.insert( order, 'order', (response_db) => {
                            response.status = true;
                            response.message = "Order created";
                            response.data = order;

                            res.send(response);
                        });
                    });

                } else {
                    response.status = false;
                    response.message = "No user products cart found"

                    res.send(response);
                }

            // });
        } else {
            response.status = false;
            response.message = "User didn't logged"

            res.send(response);
        }

    });
});

router.get('/order/get', (req, res, next) => {
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

    if (user) {
        query.number = parseInt(query.number);

        Mongo.select({ number: query.number }, 'order', (response_db) => {
            const orders = response_db;

            if (orders.length >= 0) {
                response.data = orders[0];
                response.status = true;
                response.message = 'Order loaded';

                res.send(response);
            } else {
                res.send(response);
            }

        });
    } else {
        response.status = false;
        response.message = "User didn't logged";

        res.send(response);
    }
})

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
        Mongo.select({ status: query.type }, 'order', (response_db) => {
            const orders = response_db;

            orders.forEach( o => delete o.cart );

            if (query.page && !query.page != 'all') {
                query.page = parseInt(query.page);

                response.data = orders.filter( (o, index) => {
                    if (index >= (query.page - 1) * 40 && index < query.page * 40) {
                        return o;
                    }
                }).reverse();

            } else {
                response.data = orders.reverse();
            }

            response.status = true;
            response.message = 'Orders loaded';
            response.pages = Math.ceil(orders.length/40);

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

    console.log(request);

    if (user && user.admin) {
        delete request._id;

        Mongo.update({ number: request.number }, request, 'order', (response_db) => {
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