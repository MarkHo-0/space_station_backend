import { Router } from "express";
const router = Router()

import * as Controller from "../controllers/thread.js"

//獲取貼文列表
router.get('/', Controller.getThreads)
//透過編號獲取指定貼文
router.get('/:tid', Controller.getThreadByID)

module.exports = router;