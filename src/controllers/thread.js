import {Request, Response} from 'express'

const MAX_THREADS_PRE_GET = 15;

/**
 * @param {Request} req 
 * @param {Response} res 
 */
function getAllThreads(req, res) {
    const {cursor, order, cid, fid} = req.params

    if (typeof cursor != 'string' || cursor < 1) cursor = 1
    if (typeof order != 'number' || order < 0 || order > 1) order = 1
    if (typeof cid != 'number' || cid < 0 || cid > 1) cid = 0
    if (typeof fid != 'number' || fid < 0) cid = 0

}

function getThreadByID(req, res) {

}

module.exports = {
    getAllThreads,
    getThreadByID
}