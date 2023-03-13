import { Router } from "express";
import * as Controller from "../controllers/class_swap.js"
import { authUser } from "../middlewares/authUser.js";

const router = Router()

//進行統一身分驗證 (下方路由均需要身份訊息)
router.use(authUser)

//搜尋他人發布的交換請求
router.get('/search', Controller.searchSwapRequest)

//獲取請求紀錄
router.get('/record', Controller.viewSwapRecords)

//發布新的交換請求
router.post('/request', Controller.postSwapRequest)

//刪除過往的交換請求
router.delete('/request/:id', Controller.removeSwapRequest)

//重新發佈過往的交換請求
router.post('/request/:id/repost', Controller.repostSwapRequest)

//進行交換
router.post('/swap', Controller.performSwap)

export default router