var express = require('express');
var router = express.Router();

var Users = require('../modules/Users');

router.post('/adminLogin', (req, res, next) => {
	//console.log(sess, 'hahahaha');
	let parse = "";

	req.on('data', (data) => {
		parse+=data;
	});

	req.on('end', (err) => {
		if (err) throw err;

		let admin = JSON.parse(parse);

		Users.adminLogin(admin, (data) => {

			if (data.length) {
				if (Users.checkCredentials(data[0], admin)) {
					Users.createSession(req, res, next, data[0], (data) => {
						res.send('Logged');
					});
				} else {
					res.send('Error: Check your login or password!');
				}

			} else {
				res.send('User not found');
			}

		});

	});

});

module.exports = router;