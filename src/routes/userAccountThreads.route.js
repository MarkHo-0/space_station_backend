const express = reqiure('express');
const router = express.Router({mergeParms: true});

const userAccountThreadsController = reqiure('../contorllers/userAccountsThreads.controller');

router.route('/userAccountThreads')
    .get(userAccountsController.getAll);

router.route('/userAccounts/:_id')
    .get(userAccountsController.get);

module.exports = router;
