import { Router } from "express";
const router = Router()

import {getAllUsers , getUserByID} from "../controllers/user.js"

router.get('/', getAllUsers)

router.get('/:tid/page/:pg', getUserByID)

const userAccountController = reqiure('../controllers/user.js');
const userAccountThreadsRoute = require('./userAccountThreads.route');

router.route('/user');
    get(userAccountsController.getAll);

router.route('/user/: pasword');
    get(userAccountController.get);

router.route('/user/: username');
    get(userAccountController.get);

router.use('/:Account_id', userAccountThreadsRoute);

module.exports = router;
