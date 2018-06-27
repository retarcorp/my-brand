var express = require('express');
var router = express.Router();

var Users = require('../modules/Users');

router.post('/login', (req, res, next) => {
	let parse = "";

	req.on('data', (data) => {
		parse += data;
	});

	//console.log(req.session);

	req.on('end', (err) => {
		//if (err) console.log(err);

		let user = JSON.parse(parse);

		Users.find(user, 'users', (data) => {

			if (data.length) {
				if (Users.checkCredentials(data[0], user)) {
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