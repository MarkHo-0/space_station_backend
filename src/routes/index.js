import { Router } from "express";
const router = Router()

import { mountDB } from '../middlewares/mountDB.js'
import { getConnection } from '../database/index.js'
import { getHomeData } from '../controllers/home.js'

const ThreadRoutes = require('./thread.js')

//掛載資料庫入口到每個請求上
router.use(mountDB(getConnection))

//路由分發
router.get('/home', getHomeData)
router.use('/thread', ThreadRoutes)

module.exports = router;
