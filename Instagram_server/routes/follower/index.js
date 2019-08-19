var express = require('express');
var router = express.Router();

router.use('/', require('./follower'));
module.exports = router;
