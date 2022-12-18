import { Router } from "express";

import { authUser, tryAuthUser } from '../middlewares/authUser.js'

import { validateComment } from "../middlewares/validateCoT.js";

import * as Controller from "../controllers/comment.js"

const router = Router()

//作出留言
router.post('/', authUser, Controller.postComment)

//透過編號獲取一則留言
router.get('/:cid', tryAuthUser, Controller.getComment)


//統一留言編號檢驗
router.all('/:cid/*', authUser, validateComment)

//對一則留言點讚或點踩
router.post('/:cid/react', Controller.reactComment)

//頂置或取消頂置一則留言
router.post('/:cid/pin', Controller.pinOrUnpinComment)

//舉報一則留言
router.post('/:cid/report', Controller.reportComment)

export default router;