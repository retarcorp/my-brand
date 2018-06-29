var express = require('express');
var multiparty = require('multiparty');
var path = require('path');
var fs = require('fs');

var Mongo = require('../modules/Mongo');

var router = express.Router();

router.post('/upload', (req, res, next) => {
	
	let form = new multiparty.Form();

	form.parse(req, (err, fields, files) => {
		// console.log(fields, '\n', files);

		for (file in files) {
			let fle = files[file];

			fle.forEach( (fl) => {
                if (fl.path) {
                    if (fl.originalFilename.indexOf('.ttf') >= 0 || fl.originalFilename.indexOf('.otf') >= 0) {
                        fs.createReadStream(fl.path).pipe(fs.createWriteStream(`public/fonts/${fl.originalFilename}`));
                        Mongo.update({ font: fields.font[0] }, { font: fields.font[0], src: `/fonts/${fl.originalFilename}` }, 'fonts');
                    }

                    if (fl.headers['content-type'].indexOf('image/png') >= 0) {
                        fs.createReadStream(fl.path).pipe(fs.createWriteStream(`public/img/basis/${fl.originalFilename}`));
                    }
                }
			})
			
		}

		res.send({ status: true });
	})

});

module.exports = router;