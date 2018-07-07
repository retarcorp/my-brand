var express = require('express');
var mltp = require('multiparty');
var fs = require('fs');

var router = express.Router();

router.post('/test_blob', (req, res, next) => {

    let form = new mltp.Form();

    form.parse(req, (err, fields, files) => {
        console.log(files, files[0][0].path);

        fs.createReadStream(files[0][0].path).pipe(fs.createWriteStream(`public/img/basis/${files[0][0].originalFilename}.png`));

        res.send({status: true});
    });

});

module.exports = router;