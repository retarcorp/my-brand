var express = require('express');
var router = express.Router();
var mltp = require('multiparty');

router.post('/form_data', (req, res, next) => {
    let parse = "";

    req.on('data', (data) => {
        parse+=data;
    });

    req.on('end', () => {
        console.log(parse);
    });

    const form = new mltp.Form();

    form.parse(req, (err, fields, files) => {
        res.send({ fields: fields, files: files });
    });
});

module.exports = router;