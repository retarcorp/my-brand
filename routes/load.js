var express = require('express');
var router = express.Router();

var Mongo = require('../modules/Mongo');

var URL = require('url');
var qrs = require('querystring');
var fs = require('fs');

router.get('/load', function(req, res, next) {
	// let data = qrs.parse(URL.parse(req.url).query);

	let user = req.cookies.user.name || req.session.user.name;
		key = { user: user },
		data = qrs.parse(URL.parse(req.url).query);

	Mongo.select(key, 'uniq', (data) => {
		res.send(data);
	});

});

module.exports = router;