var express = require('express');
var router = express.Router();

var Mongo = require('../modules/Mongo');
var User = require('../modules/Users');

router.post('/order/set', (req, res, next) => {
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
                data: data
            },
            user = req.cookies.user.name || req.session.user.name;

        Mongo.select({ user: user }, 'cart', (response_db) => {
            const cart = response_db,
                order = {};

            if (cart.length) {
                order.cart = cart;
                order.order_id = data.cart_id;
                order.user = user;

                Mongo.delete( { user: user }, 'cart', (response_db) => {
                    console.log('Cart emptied');
                });

                Mongo.insert( order, 'order', (response_db) => {
                    response.status = true;
                    response.message = "Ordered";

                    res.send(response);
                });

            } else {
                response.status = false;
                response.message = "No user products cart found"

                res.send(response);
            }


        });

    });


});

module.exports = router;