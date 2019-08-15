var express = require('express');
var router = express.Router();

const resMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');
const utils = require('../../module/utils/utils');

const pool = require('../../module/pool');
const jwt = require('../../module/jwt');

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

router.post('/:idx', async (req, res) => {
    const user = jwt.verify(req.headers.token);
    let idx = req.params.idx;

    console.log("user:::"+JSON.stringify(user));

    if (user === null || !idx) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        const insertLikeQuery = 'INSERT INTO instagram.like (postIdx, userId) VALUES (?, ?)';
        const likeResult = await pool.queryParam_Parse(insertLikeQuery, [req.params.idx, user.id]);

        if (likeResult) {
            res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.SAVE_SUCCESS));
        }else{
            res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.SAVE_FAIL));
        }

    }
});

module.exports = router;