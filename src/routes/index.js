import { Router } from "express";
import cors from 'cors'
import { mountDB } from '../middlewares/mountDB.js'
import { getDB } from '../database/index.js'
import { tryAuthUser } from '../middlewares/authUser.js'
import { getHomeData } from '../controllers/home.js'
import { getToolboxStatus } from '../controllers/toolbox.js'
import ThreadRoutes from './thread.js'
import CommentRoutes from './comment.js'
import UserRoutes from './user.js'
import VerifyRoutes from './verify.js'
import ClassSwapRoutes from './class_swap.js'

const router = Router()

//解決跨域問題
router.use(cors())

//掛載資料庫入口到每個請求上
router.use(mountDB(getDB))

//路由分發
router.get('/home', tryAuthUser, getHomeData)
router.get('/toolbox', getToolboxStatus)

router.use('/thread', ThreadRoutes)
router.use('/comment', CommentRoutes)
router.use('/classswap', ClassSwapRoutes)
router.use('/user', UserRoutes)
router.use('/vfcode', VerifyRoutes)

export default router
