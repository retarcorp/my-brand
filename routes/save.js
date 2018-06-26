var express = require('express');
var router = express.Router();

var Mongo = require('../modules/Mongo');

var URL = require('url');
var qrs = require('querystring');
var fs = require('fs');

router.post('/save', function(req, res, next) {
	let parse = '';

	req.on('data', (data) => {
		parse += data;
	});

	req.on('end', () => {
		parse = JSON.parse(parse);
		parse.user = req.cookies.user.name || req.session.user.name;

		console.log(req.cookies.user, req.session.user);

		Mongo.update( { user: parse.user }, parse, 'uniq', (data) => {
			res.send(JSON.stringify({ status: 'saved' }));
		});

		//res.send(JSON.stringify({ status: 'saved' }));

	});
});

module.exports = router;