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

    console.log("user:::" + JSON.stringify(user));

    if (user === null || !idx) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        const selectUserId = 'SELECT userId FROM instagram.like WHERE postIdx = ? && userId = ?';
        const userIdResult = await pool.queryParam_Parse(selectUserId, [req.params.idx, user.id]);

        if (userIdResult[0] == null) {
            const insertLikeQuery = 'INSERT INTO instagram.like (postIdx, userId) VALUES (?, ?)';
            const likeResult = await pool.queryParam_Parse(insertLikeQuery, [req.params.idx, user.id]);

            if (likeResult) {
                res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.LIKE_SUCCESS, 1));
            } else {
                res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.LIKE_FAIL));
            }
        }else{
            const deleteLikeQuery = 'DELETE FROM instagram.like WHERE postIdx = ? && userId = ?'
            await pool.queryParam_Parse(deleteLikeQuery, [req.params.idx, user.id]);

            res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.LIKE_CANCEL, 0));
        }
    }
});

router.get('/:idx', async (req, res) => {
    const user = jwt.verify(req.headers.token);
    let idx = req.params.idx;

    console.log("user:::" + JSON.stringify(user));

    if (user === null || !idx) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        const selectLikeQuery = 'SELECT userId FROM instagram.like WHERE postIdx = ? ';
        const likeResult = await pool.queryParam_Parse(selectLikeQuery, [idx]);

        const resData = new Array();
        for (var i in likeResult) {
            resData.push(likeResult[i].userId);
        }

        if (likeResult) {
            res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.READ_SUCCESS, resData));
        } else {
            res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.READ_FAIL));
        }
    }
});

module.exports = router;