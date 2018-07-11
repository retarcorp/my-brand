var express = require('express');
var router = express.Router();
var Users = require('../modules/Users');

/* GET home page. */
router.get('/*', function(req, res, next) {
	//if (req.url.indexOf('.html') < 0)
		res.sendFile(req.url, { root: 'public/' });
});

module.exports = router;