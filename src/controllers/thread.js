import {Request, Response} from 'express'

const MAX_THREADS_PRE_GET = 15;

/**
 * @param {Request} req 
 * @param {Response} res 
 */
function getAllThreads(req, res) {
    const {page, order, cid, fid} = req.params

    if (typeof page != 'number' || page < 1) page = 1
    if (typeof order != 'number' || order < 0 || order > 1) order = 1
    if (typeof cid != 'number' || cid < 0 || cid > 1) cid = 0
    if (typeof fid != 'number' || fid < 0) cid = 0

    const sql = `SELECT * FROM thread WHERE cid=${cid} AND fid=${fid} OFFSET ${(page - 1) * MAX_THREADS_PRE_GET} LIMIT ${MAX_THREADS_PRE_GET}`
    req.app.db.query(sql, function (error, results, fields) {
        if (error || results[0] == null) return res.status(404).send()
        res.send({
            threads: results[0],
            has_next: results[0].length == 15
        })
    });
}

function getThreadByID(req, res) {

}

module.exports = {
    getAllThreads,
    getThreadByID
}