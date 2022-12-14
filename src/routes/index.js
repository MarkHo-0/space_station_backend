import { Router } from "express";

import { mountDB } from '../middlewares/mountDB.js'
import { getDB } from '../database/index.js'
import { tryAuthUser } from '../middlewares/authUser.js'

import { getHomeData } from '../controllers/home.js'

import ThreadRoutes from './thread.js'
import CommentRoutes from './comment.js'
import UserRoutes from './user.js'
import VerifyRoutes from './verify.js'

const router = Router()

//掛載資料庫入口到每個請求上
router.use(mountDB(getDB))

//路由分發
router.get('/home', tryAuthUser, getHomeData)
router.use('/thread', ThreadRoutes)
router.use('/comment', CommentRoutes)
router.use('/user', UserRoutes)
router.use('/vfcode', VerifyRoutes)

export default router
