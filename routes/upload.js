var express = require('express');
var multiparty = require('multiparty');
var path = require('path');
var fs = require('fs');
var md5 = require('md5');
var qrs = require('querystring');
var URL = require('url');
var ErrorHandler = require('../modules/ErrorHandler');

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
                    // if (fl.originalFilename.indexOf('.ttf') >= 0 || fl.originalFilename.indexOf('.otf') >= 0) {
                    //     const file_exp = (fl.originalFilename.indexOf('.ttf') >= 0) ? ".ttf" : ".otf";
                    //           file_name = md5(User.genSalt())+file_exp;
                    //
                    //     fs.createReadStream(fl.path).pipe(fs.createWriteStream(`public/fonts/${file_name}`));
                    //     Mongo.update({ font: fields.font[0] }, { font: fields.font[0], src: `/fonts/${file_name}`, fancywork: fields.fancywork[0], print: fields.print[0] },  'fonts', () => {
                    //
                    //     });
                    // }

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
                Base._3D = fields._3D[0];
                Base.type = fields.type[0];
                Base._id = fields._id[0];
                Base.colorArray = fields.colors;

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

router.post('/upload/font', (req, res, next) => {
    const query = qrs.parse(URL.parse(req.url).query),
        response = {
            status: false,
            message: 'Unexpected error',
            data: [],
            query: query,
            request: {},
            errors: [],
            log: {
                type: 'GET',
                path: '/upload/font',
                headers: req.headers
            }
        },
        user = User.checkSession(req, res, next);

    if (user && user.admin) {
        const form = new multiparty.Form();

        form.parse(req, (err, fields, files) => {
            const file = files[0][0];
            response.request = { fields: fields, files: files };

            console.log(files);

            if (file.originalFilename.indexOf('.ttf') >= 0 || file.originalFilename.indexOf('.otf') >= 0) {
                const file_exp = (file.originalFilename.indexOf('.ttf') >= 0) ? ".ttf" : ".otf",
                    file_name = md5(User.genSalt())+file_exp;

                fs.createReadStream(file.path).pipe(fs.createWriteStream(`public/fonts/${file_name}`));
                Mongo.update({ font: fields.font[0] }, {
                        font: fields.font[0],
                        src: `/fonts/${file_name}`,
                        fancywork: fields.fancywork[0],
                        print: fields.print[0],
                        _3D: fields._3D[0]
                    },

                    'fonts', () => {
                        response.status = true;
                        response.message = 'Font uploaded';

                        res.send(response);
                    });
            } else {
                response.status = false;
                response.message = "Unhandle file type";
                response.errors.push(ErrorHandler.generateError('fileType'));

                res.send(response);
            }
        });
    } else {
        response.status = false;
        response.message = "User doesn't have rights";

        res.send(response);
    }
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
                Base._3D = fields._3D[0];
                Base.type = fields.type[0];
                Base._id = fields._id[0];
                Base.colorArray = fields.colors;

                console.log(Base);

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

router.post('/upload/print', (req, res, next) => {
    let parse = "";
    const query = qrs.parse(URL.parse(req.url).query),
        response = {
            status: false,
            message: 'Unexpected error',
            data: null,
            errors: [],
            log: {
                type: 'POST',
                path: '/upload/print',
                headers: req.headers
            }
        },
        print = {};

    let form = new multiparty.Form(),
        file_name = "",
        fileUp = false,
        fle = null;


    form.parse(req, (err, fields, files) => {
        if (err) {
            response.status = false;
            response.message = "Form data parse error";
            response.errors.push(err);
            console.log(err);
        }

        for (let file in files) {
            file = files[file][0];
            fle = file;

            if (file.headers['content-type'].indexOf('image/png') >= 0) {
                file_name = (query._id && query._id != '0') ? fields.file_name[0] : md5(User.genSalt(12))+'.png';

                fs.createReadStream(file.path).pipe(fs.createWriteStream(`public/img/prints/${file_name}`));
                fileUp = true;
            }
        }

        if (fileUp) {
            response.data = {
                fields: fields,
                files: files
            };

            print.name = fields.name[0];
            print.tags = JSON.parse(fields.tags[0]);
            print.fancywork = fields.fancywork[0];
            print.print = fields.print[0];
            print._3D = fields._3D[0];
            print.src = `img/prints/${file_name}`;

            query._id = (query._id && query._id != '0') ? query._id : md5(User.genSalt(12));

            let tags = print.tags,
                data = { _id: 'globalTagIDArray', tags: [] };

            Mongo.select({}, 'tags', (response_db) => {
                data = response_db[0] || data;

                data.tags.push(...tags.filter( tag => !data.tags.find( t => tag == t )));

                data._id = 'globalTagIDArray';

                Mongo.update({ _id: data._id }, data, 'tags', (response_db) => {
                    console.log('Tags inserted');
                });
            });

            Mongo.update( { _id: query._id }, print, 'prints', (response_db) => {
                response.status = true;
                response.message = "Data uploaded";

                res.send(response);
            });
        } else {
            response.message = 'Unknown file type';
            response.status = false;

            response.error.push(ErrorHandler.generateError('fileType', { file: fle.originalFilename, options: req.headers }));

            res.send(response);
        }

    });
});

module.exports = router;