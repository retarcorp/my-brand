var express = require('express');
var router = express.Router();

router.get('/profile', (req, res, next) => {
    res.sendFile('favorites.html', { root: 'public' });
});

module.exports = router;