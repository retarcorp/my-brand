var express = require('express');
var router = express.Router();
var Users = require('../modules/Users');

/* GET home page. */
router.get('/*', function(req, res, next) {

	// console.log(req.session.logged, req.cookies.user)
	
	if (req.session.logged || req.cookies.user) {
		res.sendFile(req.url, { root: 'public/' });
		req.session.logged = true;
	} else {
		if(req.url.indexOf('.css') >= 0) {
			res.sendFile(req.url, { root: 'public/' });
		} else {
			res.sendFile('login.html', { root: 'views/'});
		}
	}

});

module.exports = router;