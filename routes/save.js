var express = require('express');
var router = express.Router();

var URL = require('url');
var qrs = require('querystring');
var fs = require('fs');

router.post('/save', function(req, res, next) {
	let parse = '';

	req.on('data', (data) => {
		parse += data;
	});

	req.on('end', () => {
		
		fs.writeFile('project.json', parse, 'utf8', () => {
			console.log('Saved user ID project');
		});

		res.send(JSON.stringify({ status: 'saved' }));
	});
});

module.exports = router;