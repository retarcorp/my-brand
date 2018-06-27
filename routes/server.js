var express = require('express');
var router = express.Router();
var Users = require('../modules/Users');

/* GET home page. */
router.get('/*', function(req, res, next) {
		res.sendFile(req.url, { root: 'public/' });
});

module.exports = router;