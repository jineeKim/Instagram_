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

router.get('/', async (req, res) => {
    const user = jwt.verify(req.headers.token);

    console.log("user:::" + JSON.stringify(user));

    if (user < 0) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        const selectFollowingQuery =
            'SELECT U.id, U.userIdx ' +
            'FROM user AS U ' +
            'JOIN follow AS F ON F.followingIdx = U.userIdx ' +
            'WHERE F.userIdx = ? ';

        const followingResult = await pool.queryParam_Parse(selectFollowingQuery, [user.userIdx]);

        if (followingResult) {
            res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.READ_SUCCESS, followingResult));
        } else {
            res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.READ_FAIL));
        }
    }
});

router.post('/:idx', async (req, res) => {
    const user = jwt.verify(req.headers.token);
    let idx = req.params.idx;

    console.log("user:::" + JSON.stringify(user));

    if (user === null || !idx) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        const selectFollowingIdx = 'SELECT followingIdx FROM follow WHERE followingIdx = ? && userIdx = ?';
        const userIdResult = await pool.queryParam_Parse(selectFollowingIdx, [idx, user.userIdx]);

        if (userIdResult[0] == null) {
            const insertFollowingQuery = 'INSERT INTO follow (userIdx, followingIdx) VALUES (?, ?)';

            const followingResult = await pool.queryParam_Arr(insertFollowingQuery, [user.userIdx, idx]);
            if (followingResult){
                res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.FOLLOW_SUCCESS, true));
            } else{
                res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.FOLLOW_FAIL));
            }
        } else {
            const deleteFollowingQuery = 'DELETE FROM instagram.follow WHERE followingIdx = ? && userIdx = ?'
            const deleteResult = await pool.queryParam_Parse(deleteFollowingQuery, [idx, user.userIdx]);

            if (deleteResult){
                res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.FOLLOW_CANCEL, false));
            } else{
                res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.FOLLOW_FAIL));
            }
        }
    }
});

module.exports = router;