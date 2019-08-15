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

router.patch('/id', async (req, res) => {
    const user = jwt.verify(req.headers.token);

    if (user === null || !req.body.id) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        const selectIdQuery = 'SELECT id FROM user WHERE id = ';
        const result = await pool.queryParam_Parse(selectIdQuery, [req.body.id]);

        if (result === null) {
            const updateUserQuery = 'UPDATE user SET id = ? WHERE userIdx = ?';
            await pool.queryParam_Parse(updateUserQuery, [req.body.id, user.userIdx]);
            res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.UPDATE_SUCCESS));
        }else{
            res.status(200).send(utils.successFalse(statusCode.FORBIDDEN, resMessage.DUPLICATION_NICKNAME));
        }

    }
});

router.patch('/profile', async (req, res) => {
    const user = jwt.verify(req.headers.token);

    if (user === null || !req.body.profile) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        const updateUserQuery = 'UPDATE user SET img = ? WHERE userIdx = ?';
        await pool.queryParam_Parse(updateUserQuery, [req.body.profile, user.userIdx]);

        res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.UPDATE_SUCCESS));
    }
});

router.get('/user', async (req, res) => {
    const user = jwt.verify(req.headers.token);

    if (user === null) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    }else if(user < 0){
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.INVALID_TOKEN));
    } else {
        const selectUserQuery = 'SELECT * FROM user WHERE userIdx = ?';
        const result = await pool.queryParam_Parse(selectUserQuery, [user.userIdx]);

        console.log("userIdx:::" + JSON.stringify(user.userIdx));

        delete result[0].userIdx;
        delete result[0].authType;
        delete result[0].pw;

        res.status(200).send(utils.successTrue(statusCode.OK, resMessage.READ_SUCCESS, result[0]));
    }
});

module.exports = router;