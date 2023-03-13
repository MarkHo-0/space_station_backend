import { Router } from "express";
import * as Controller from "../controllers/study_partner.js"
import { authUser } from "../middlewares/authUser.js";

const router = Router()

//進行統一身分驗證 (下方路由均需要身份訊息)
router.use(authUser)

//獲取招聘
router.get('/post', Controller.getPosts)

//發布新的招聘
router.post('/post', Controller.postStudyPartnerPost)

//刪除過往的招聘
router.delete('/post/:id', Controller.removeStudyPartnerPost)

//編輯過往的招聘
router.patch('/post/:id', Controller.editStudyPartnerPost)

export default router