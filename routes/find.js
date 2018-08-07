var express = require('express');
var router = express.Router();

var Mongo = require('../modules/Mongo');

router.post('/find/template/by/tag', (req, res, next) => {
    let parse = "";

    req.on('data', (data) => {
        parse+=data;
    });

    req.on('end', (err) => {
        if (err) console.error(err);

        console.log(parse);

        const data = JSON.parse(parse),
            response = {
                status: false
                ,message: "Error occurred"
                ,data: []
                ,request: data
            };

        if (data.length) {
            const tags = data;

            response.status = true;

            Mongo.select({}, 'admin', (response_db) => {
                let templates = response_db;

                templates.variants
            });

        } else {
            response.status = false;
            response.message = "No Tags presented in request";
            response.data = [];

            res.send(response);
        }
    })
});

module.exports = router;
