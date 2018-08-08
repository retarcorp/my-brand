var express = require('express');
var router = express.Router();

var Mongo = require('../modules/Mongo');
var User = require('../modules/Users');

var URL = require('url');
var qrs = require('querystring');
var fs = require('fs');
var md5 = require('md5');

router.post('/save', function(req, res, next) {
	let parse = '';

	req.on('data', (data) => {
		parse += data;
	});

	req.on('end', () => {
		parse = JSON.parse(parse);
		parse.user = req.cookies.user.name || req.session.user.name;

        let collection = (parse.template) ? 'admin' : 'uniq';

		Mongo.select( {user: parse.user }, 'uniq', (data) => {
			if (data.length) {
				let id = 1;

				if (!parse.id) {
					data.map( (proj) => {
						if (proj.id > id) id = proj.id;
					});

					parse.id = id+1;
				}

			} else {
				parse.id = 1;
			}

            Mongo.update( { user: parse.user, id: parse.id }, parse, collection, (data) => {
                res.send(JSON.stringify({ status: true, id: parse.id }));
            });
		});


		//res.send(JSON.stringify({ status: 'saved' }));

	});
});


router.post('/save/template', (req, res, next) => {
	let parse = "";

	req.on('data', (data) => {
		parse += data;
	});

	req.on('end', (err) => {
		if (err) console.log(err);

		const user = req.cookies.user.name || req.session.user.name;
		let data = JSON.parse(parse);

		console.log(data);

		data._id = (data._id) ? data._id : md5(User.genSalt(12));

		Mongo.update( { _id: data._id }, data, 'admin', (response_db) => {
            res.send({status: true});
        });
	});

});

module.exports = router;