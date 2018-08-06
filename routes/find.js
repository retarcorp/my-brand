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

            Mongo.select({}, 'admin', (db) => {
                const templates = db;

                response.data = templates.filter( (template) => {
                    return tags.some( (tag) => {
                        return template.tags.find( (t) => t == tag);
                    });
                });

                response.data.sort( (templateA, templateB) => {
                    let tagA = 0,
                        tagB = 0;

                    templateA.tags.map( (tag) => {
                        tagA = tags.filter( (t) => t == tag).length;
                    });

                    templateB.tags.map( (tag) => {
                        tagB = tags.filter( (t) => t == tag).length;
                    });

                    return tagA - tagB;
                });

                response.message = (response.data.length) ? "Find some templates" : "There is no templates matched by tags";

                res.send(response);
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
