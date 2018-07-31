var express = require('express');
var router = express.Router();

var URL = require('url');
var qrs = require('querystring');
var fs = require('fs');

var Mongo = require('../modules/Mongo');

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

module.exports = router;
