import { Router } from "express";

import { authUser, tryAuthUser } from '../middlewares/authUser.js'

import * as Controller from "../controllers/thread.js"

const router = Router()

//獲取貼文列表
router.get('/', Controller.getThreads)

//發表一則新的貼文
router.post('/', authUser, Controller.postThread)

//透過編號獲取指定貼文
router.get('/:tid', tryAuthUser, Controller.getThread)

//透過關鍵字搜尋貼文
router.get('/search', Controller.searchThread)

export default router;