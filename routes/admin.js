var express = require('express');
var router = express.Router();

router.get('/admin', (req, res, next) => {

	if (!req.session.user || !req.cookies.user) {
		console.log('/admin1');
		res.sendFile('login.html', { root: 'views/'});
	} else if (!req.cookies.user.admin) {
		console.log(req.cookies.user);
		res.sendFile('login.html', { root: 'views/'});
	} else {
		console.log('/admin3');
		res.sendFile('admin_panel.html', { root: 'views/'});
	}

});

module.exports = router;