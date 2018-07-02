var express = require('express');
var multiparty = require('multiparty');
var path = require('path');
var fs = require('fs');

var Mongo = require('../modules/Mongo');
var Bases = require('../modules/Bases');

var router = express.Router();

router.post('/upload', (req, res, next) => {
	
	let form = new multiparty.Form();

	form.parse(req, (err, fields, files) => {
		// console.log(fields, '\n', files);

        let Base = {
            name: "",
            price: "",
            variants: [],
            size: []
        };

        console.log(fields);

		for (file in files) {
			let fle = files[file];

			fle.forEach( (fl, index) => {
                if (fl.path) {
                    if (fl.originalFilename.indexOf('.ttf') >= 0 || fl.originalFilename.indexOf('.otf') >= 0) {
                        fs.createReadStream(fl.path).pipe(fs.createWriteStream(`public/fonts/${fl.originalFilename}`));
                        Mongo.update({ font: fields.font[0] }, { font: fields.font[0], src: `/fonts/${fl.originalFilename}` }, 'fonts', () => {
                            res.send({ status: true });
                        });
                    }

                    if (fl.headers['content-type'].indexOf('image/png') >= 0) {
                        fs.createReadStream(fl.path).pipe(fs.createWriteStream(`public/img/basis/${fl.originalFilename}`));

                        let variant = JSON.parse(fields[index]);

                        variant.image = "img/"+fl.originalFilename;
                        Base.variants.push(variant);
                        //Bases.formBaseData(fields);
                    }
                }
			})

            if (Base.variants.length ) {

			    console.log(fields.print[0], fields.fancywork[0])

			    if (fields.print[0] != 'true' && fields.fancywork[0] != 'true') {
			        res.send({status: false});
                } else {
                    Base.name = fields.base[0];
                    Base.size = fields.size;
                    Base.price = fields.price[0];
                    Base.fancywork = fields.fancywork[0];
                    Base.print = fields.print[0];

                    Mongo.update({ name: Base.name }, Base, 'bases', (data) => {
                        console.log('ISERTED BASE');
                        res.send({ status: true });
                    });
                }
            }
		}
	})

});

module.exports = router;