import { Router } from "express";

import { authUser, tryAuthUser } from '../middlewares/authUser.js'

import validateTID from "../middlewares/validateCommentID.js";

import * as Controller from "../controllers/comment.js"

const router = Router()

//作出留言
router.post('/', authUser, Controller.postComment)


//統一留言編號檢檢驗
router.all('/:cid*', validateTID)

//透過編號獲取一則留言
router.get('/:cid', tryAuthUser, Controller.getComment)

//對一則留言點讚或點踩
router.post('/:cid/react', authUser, Controller.reactComment)

//頂置或取消頂置一則留言
router.post('/:cid/pin', authUser, Controller.pinOrUnpinComment)

//舉報一則留言
router.post('/:cid/report', authUser, Controller.reportComment)

module.exports = router;