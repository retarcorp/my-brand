var express = require('express');
var router = express.Router();

var URL = require('url');
var qrs = require('querystring');
var fs = require('fs');

router.get('/load', function(req, res, next) {
	// let data = qrs.parse(URL.parse(req.url).query);

	fs.readFile('project.json', (error, read) => {
		res.send(read);
	})
});

module.exports = router;