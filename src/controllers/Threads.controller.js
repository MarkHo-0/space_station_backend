const app = require('../app/Threads.app');
const get = function(req, res){
    res.send(Threadsapp.get(req.parms._id))
}

const getAll = function(req, res){
    res.send(Threadsapp.getAll())
}

module.exports = {
    get, 
    getAll
};