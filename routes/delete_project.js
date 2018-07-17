var express = require('express');
var router = express.Router();

var url = require('url');
var qrs = require('querystring');

var Mongo = require('../modules/Mongo');

router.get('/delete_project', (req, res, next) => {
    const q_data = qrs.parse(url.parse(req.url).query);

    if (q_data.id) {
        Mongo.delete({ id: parseInt(q_data.id) }, 'uniq', (data) => {
            console.log(q_data.id);
            res.send({status: true});
        });
    } else {
        res.send({status: false});
    }

});

module.exports = router;