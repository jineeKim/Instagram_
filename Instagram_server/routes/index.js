var express = require('express');
var router = express.Router();

router.use('/auth', require('./auth/index'));
router.use('/myPage', require('./myPage'));
router.use('/image', require('./image'));
router.use('/post', require('./post'));
router.use('/like', require('./like'));
router.use('/comment', require('./comment'));
router.use('/follower', require('./follower'));
router.use('/following', require('./following'));
router.use('/main', require('./main'));


module.exports = router;
