var express = require('express');
var router = express.Router();

var URL = require('url');
var qrs = require('querystring');
var fs = require('fs');

var Mongo = require('../modules/Mongo');
var ErrorHandler = require('../modules/ErrorHandler');

router.get('/delete', (req, res, next) => {

    let data = qrs.parse(URL.parse(req.url).query);

    console.log(data);

    if (data.type) {
        switch (data.type) {
            case 'font':

                fs.unlink("./public/"+data.src, (err) => {
                    if (err) {
                        console.log(err);
                        res.send(JSON.stringify(err));

                    } else {
                        Mongo.delete({ src: data.src }, 'fonts', () => {
                            res.send(JSON.stringify({status: true}));
                        });
                    }
                });

                break;

            case 'base':
                let files = data.files.split("|");

                files.forEach( (file) => {
                    fs.unlink("./public/"+file, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                });

                console.log(data);

                Mongo.delete( { "base._id": data._id }, 'uniq');
                Mongo.delete( { "base._id": data._id }, 'admin');

                Mongo.delete({ _id: data._id }, 'bases', () => {
                    res.send({status: true});
                });

                break;

            default:
                res.send('Nothing to delete');
        }
    }

});

router.get('/delete/template', (req, res, next) => {

    const user = req.cookies.user.name || req.session.user.name,
        query = qrs.parse(URL.parse(req.url).query),
        response = {
            data: [],
            query: query,
            status: false,
            message: "Unexpected error",
            errors: [],
            log:  {
                type: "GET",
                path: '/delete/template',
                headers: req.headers
            }
        }

    // res.send({status: true, message: 'Template delete'});

    Mongo.delete({ _id: query._id}, 'admin', (data) => {
        response.status = true;
        response.message = "Template deleted";

        res.send(response);
    });

});

router.get('/delete/print', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query),
        response = {
            status: false,
            message: 'Unexpected error',
            data: [],
            query: query,
            errors: [],
            log: {
                headers: req.headers,
                type: 'GET',
                path: '/delete/print'
            }
        };

    if (query._id) {
        fs.unlink('public/'+query.src, (err) => {
            if (err) {
                console.log(err);
                response.errors.push(err);
            }
        });

        Mongo.select({ _id: query._id }, 'prints', (response_db) => {
            const print = response_db[0];

            if (print) {
                Mongo.select({}, 'tags', (response_db) => {
                    const data = response_db[0];

                    if (data) {
                        let tags = data.tags;

                        tags = tags.filter( t => {
                            return !print.tags.find( tag => t == tag);
                        });
                        data.tags = tags;

                        Mongo.update({ _id: data._id }, data, 'tags');

                        Mongo.delete({ _id: query._id }, 'prints', (response_db) => {
                            response.status = true;
                            response.message = "Print deleted";

                            res.send(response);
                        });
                    } else {
                        response.status = false;
                        response.message = "No tags presented in DB";

                        res.send(response);
                    }
                });
            } else {
                response.status = false;
                response.message = "Print didn't match";

                res.send(response);
            }
        });

    }
});

router.get('/delete/cart', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query),
        response = {
            status: false,
            message: 'Unexpected error',
            data: [],
            query: query,
            errors: [],
            log: {
                type: 'GET',
                path: '/delete/cart',
                headers: req.headers
            }
        }

        if (query.cart_id) {
            Mongo.delete({ cart_id : query.cart_id }, 'cart', (response_db) => {
                response.status = true;
                response.message = "Item deleted";

                res.send(response);
            });
        } else {
            response.status = false;
            response.message = "No cart_id specified";
            response.errors.push(ErrorHandler.generateError('dataExpected'));

            res.send(response);
        }
});

module.exports = router;
