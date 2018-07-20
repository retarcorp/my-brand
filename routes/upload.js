var express = require('express');
var multiparty = require('multiparty');
var path = require('path');
var fs = require('fs');
var md5 = require('md5');

var Mongo = require('../modules/Mongo');
var Bases = require('../modules/Bases');

var User = require('../modules/Users');

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
        },
            iterator = 0,
            file_name = "something",
            redact = (fields.redact) ? fields.redact[0] : false;

        //console.log(files, fields);

		for (file in files) {
			let fle = files[file];

			fle.forEach( (fl, index) => {

                if (fl.path) {
                    if (fl.originalFilename.indexOf('.ttf') >= 0 || fl.originalFilename.indexOf('.otf') >= 0) {
                        const file_exp = (fl.originalFilename.indexOf('.ttf') >= 0) ? ".ttf" : ".otf";
                              file_name = md5(User.genSalt())+file_exp;

                        fs.createReadStream(fl.path).pipe(fs.createWriteStream(`public/fonts/${file_name}`));
                        Mongo.update({ font: fields.font[0] }, { font: fields.font[0], src: `/fonts/${file_name}`, fancywork: fields.fancywork[0], print: fields.print[0] },  'fonts', () => {

                        });
                    }

                    //console.log(fl.headers['content-type']);

                    if (fl.headers['content-type'].indexOf('image/png') >= 0) {

                        // fs.unlink(`public/img/basis/${fl.originalFilename}`, (err) => {
                        //     if(err) console.log(err);
                        // });

                        file_name = md5(User.genSalt())+'.png';
                        
                        fs.createReadStream(fl.path).pipe(fs.createWriteStream(`public/img/basis/${file_name}`));

                        let variant = JSON.parse(fields[iterator]);

                        variant.image = "img/basis/"+file_name;

                        //console.log(variant);

                        Base.variants.push(variant);
                        //Bases.formBaseData(fields);
                    }
                }

                iterator++;
			});
		}

        if (Base.variants.length) {
            if (fields.print[0] != 'true' && fields.fancywork[0] != 'true') {
                console.log("???")
                res.send({status: false});
            } else {
                Base.name = fields.name[0];
                Base.size = fields.size;
                Base.price = fields.price[0];
                Base.fancywork = fields.fancywork[0];
                Base.print = fields.print[0];
                Base.type = fields.type[0];
                Base._id = fields._id[0];

                Mongo.update({ _id: Base._id }, Base, 'bases', (data) => {
                    console.log('ISERTED BASE');
                    res.send({ status: true, redact: redact, base: Base });
                });
            }
        } else {
		    res.send({status: true});
        }

	})

});

router.post('/upload/redact', (req, res, next) => {
    let form = new multiparty.Form();

    form.parse(req, (err, fields, files) => {
        // console.log(fields, '\n', files);

        let Base = {
            name: "",
            price: "",
            variants: [],
            size: []
        },
            iterator = 0,
            file_name = "something",
            redact = (fields.redact) ? fields.redact[0] : false;

        //console.log(files, fields);

        for (file in files) {
            let fle = files[file];

            fle.forEach( (fl, index) => {

                if (fl.path) {
                    if (fl.headers['content-type'].indexOf('image/png') >= 0) {
                        file_name = md5(User.genSalt())+'.png';
                        
                        fs.createReadStream(fl.path).pipe(fs.createWriteStream(`public/img/basis/${fl.originalFilename}`));

                        let variant = JSON.parse(fields[iterator]);

                        variant.image = "img/basis/"+fl.originalFilename;

                        Base.variants.push(variant);
                        //Bases.formBaseData(fields);
                    }
                }

                iterator++;
            });
        }

        if (Base.variants.length) {
            if (fields.print[0] != 'true' && fields.fancywork[0] != 'true') {
                res.send({status: false});
            } else {
                Base.name = fields.name[0];
                Base.size = fields.size;
                Base.price = fields.price[0];
                Base.fancywork = fields.fancywork[0];
                Base.print = fields.print[0];
                Base.type = fields.type[0];
                Base._id = fields._id[0];

                Mongo.update({ _id: Base._id }, Base, 'bases', (data) => {
                    console.log('ISERTED BASE');
                    res.send({ status: true, redact: redact, base: Base });
                });
            }
        } else {
            res.send({status: true});
        }

    })
});

module.exports = router;