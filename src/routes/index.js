import { Router } from "express";
const router = Router()

const ThreadRoutes = require('./thread.js')
const authUser = require('../middlewares/authUser.js')

router.use(authUser)
router.use('/thread', ThreadRoutes)