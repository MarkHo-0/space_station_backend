const express = reqiure('express');
const Threads = require('./userAccountThreads.route');
const userAccount = require('./userAccount.route');
const userlogin = require('./userLogin.route')
const register = require('./userRegister.route')

const router = express.Router();

router.use('/userAccountThreads', Threads);
router.use('/userAccounts', accounts);

router.get('/', (req,res) => res.send('test time'));
router.get('/userpost', (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'ok',
        timestamp: Date.now()
    };
    res.send(JSON.stringify(healthcheck));
});

module.exports = router;
import { Router } from "express";
const router = Router()

const ThreadRoutes = require('./thread.js')
const authUser = require('../middlewares/authUser.js')

router.use(authUser)
router.use('/thread', ThreadRoutes)
