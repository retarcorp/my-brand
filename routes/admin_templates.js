var express = require('express');
var mltp = require('multiparty');

var Mongo = require('../modules/Mongo');

var router = express.Router();

router.post('/save/template', (req, res, next) => {
    let form = new mltp.Form();

    form.parse(req, (err, fields, files) => {
        console.log(fields);
        console.log(files);

        res.send({status: true});
    });

});

module.exports = router;
