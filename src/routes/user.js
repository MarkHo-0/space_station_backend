import { Router } from "express";
const router = Router()

import { authUser, tryAuthUser } from '../middlewares/authUser'

import * as Controller from "../controllers/user.js"

//獲取用戶資料
router.get('/:uid', tryAuthUser, Controller.getUserData)

//獲取用戶貼文
router.get('/:uid/thread', Controller.getUserThreads)

//獲取用戶賬號狀態
router.get('/:sid/state', Controller.getUserState)

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

module.exports = router;
