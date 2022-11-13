const accountsService = require('../services/userAccountThreads.service');

const get = function(req, res){
    res.send(accountsService.get(req.params._id));
}

const getAll = function(req, res){
    res.send(accountsService.getAll());
}

module.exports = {
    get,
    getAll
};