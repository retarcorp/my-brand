var express = require('express');
var Mongo = require('../modules/Mongo');
var URL = require('url');
var qrs = require('querystring');

var router = express.Router();

router.get('/fonts', (req, res, next) => {
	let data = qrs.parse(URL.parse(req.url).query);

	Mongo.select({}, 'fonts', (fonts) => {
		res.send(JSON.stringify(fonts));
	});
});

module.exports = router;