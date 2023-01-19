import { Router } from "express";
import { authUser, tryAuthUser } from '../middlewares/authUser.js'
import * as Controller from "../controllers/user.js"

const router = Router()

//獲取用戶資料
router.get('/:uid', tryAuthUser, Controller.getUserData)

//獲取用戶貼文
router.get('/:uid/thread', Controller.getUserThreads)

//獲取用戶賬號狀態
router.get('/state/:sid', Controller.getUserState)

//用戶註冊
router.post('/register', Controller.userRegister)

//用戶登入
router.post('/login', Controller.userLogin)

//用戶登出
router.post('/logout', authUser, Controller.userLogout)

//更改用戶科系
router.patch('/faculty', authUser, Controller.updateUserFaculty)

//更改用戶名稱
router.patch('/nickname', authUser, Controller.updateUserNickname)

export default router;
