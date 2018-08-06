var express = require('express');
var router = express.Router();

var Mongo = require('../modules/Mongo');
var ObjectId = require('mongodb').ObjectID;
var User = require('../modules/Users');

var md5 = require('md5');

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

                Mongo.update( { cart_id: project.cart_id }, data, 'cart', (response_db) => {
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

module.exports = router;