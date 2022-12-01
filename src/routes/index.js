import { Router } from "express";
const router = Router()

import { mountDB } from '../middlewares/mountDB.js'
import { getDB } from '../database/index.js'
import { tryAuthUser } from '../middlewares/authUser'

import { getHomeData } from '../controllers/home.js'

const ThreadRoutes = require('./thread.js')
const UserRoutes = require('./user.js')

//掛載資料庫入口到每個請求上
router.use(mountDB(getDB))

//路由分發
router.get('/home', tryAuthUser, getHomeData)
router.use('/thread', ThreadRoutes)
router.use('/user', UserRoutes)


module.exports = router;
