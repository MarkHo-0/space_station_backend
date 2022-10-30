const express = reqiure ('express');
const router = express.Router({mergeParams: true});

const userAccountController = reqiure('../controllers/userAccount.controller');
const userAccountThreadsRoute = require('./userAccountThreads.route');

router.route('/users');
    get(userAccountsController.getAll);

router.route('/user/: pasword');
    get(userAccountController.get);

router.route('/user/: username');
    get(usrAccountControlller.get);

router.use('/:Account_id', userAccountThreadsRoute);

module.exports = router;
