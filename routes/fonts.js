var express = require('express');
var Mongo = require('../modules/Mongo');

var URL = require('url');
var qrs = require('querystring');

var router = express.Router();

router.get('/fonts', (req, res, next) => {
	let data = qrs.parse(URL.parse(req.url).query);

	Mongo.select({}, 'fonts', (fonts) => {

		let page = parseInt(data.page) || data.page,
			out = {},
			resp = [];

		fonts.reverse();

		console.log(fonts.length);

		console.log(page);

		if (page != 'all') {
            resp = fonts.filter( (font, index) => {
                if (index >= (page - 1) * 8 && index < page * 8) {
                    return font;
                } else return false;
            });
		} else {
			resp = fonts;
		}

        out.fonts = resp;
        out.pages = Math.ceil(fonts.length/8);

		res.send(JSON.stringify(out));
	});
});

module.exports = router;