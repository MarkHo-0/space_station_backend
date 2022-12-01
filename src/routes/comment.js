import { Router } from "express";
const router = Router()

import { authUser, tryAuthUser } from '../middlewares/authUser'

import * as Controller from "../controllers/comment.js"

//透過編號獲取一則留言
router.get('/:cid', tryAuthUser, Controller.getComment)

//對一則留言點讚或點踩
router.post('/:cid/react', authUser, Controller.reactComment)

//頂置或取消頂置一則留言
router.post('/:cid/pin', authUser, Controller.pinComment)

//舉報一則留言
router.post('/:cid/report', authUser, Controller.reportComment)

module.exports = router;