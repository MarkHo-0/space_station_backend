const express = require('express');
const router = express.Router();
const { register, login } = require('./middlewares/authUser');

router.route('/authUser')
    .get(authUser.getAll);

router.route('/authUser/:_username')
    .get(authUserMiddleware.get)

router.route('/authUser/:_password')
    .get(authUserMiddleware.get)

router.route('./middlewares/login').post(login);
    module.exports = router;