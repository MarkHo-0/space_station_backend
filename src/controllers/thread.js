import { Thread } from '../models/thread.js';
import { Comment } from '../models/comment.js';

/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

const MAX_THREADS_PRE_GET = 15;
const MAX_COMMENTS_PRE_GET = 15;

/** @type {RouteFunction} */
export function getThreads(req, res) {
    const {cursor, order, pid, fid} = req.params

    //參數校驗
    if (typeof cursor != 'string' || cursor < 1) cursor = 0
    if (typeof order != 'number' || order < 0 || order > 1) order = 0
    if (typeof pid != 'number' || pid < 0 || pid > 1) pid = 0
    if (typeof fid != 'number' || fid < 0) fid = 0

    //是按熱度還是按發文時間先後搜尋
    const getFunction = order == 0 ? req.db.thread.getHeatestWithParams : req.db.thread.getNewestWithParams 

    //執行資料庫查詢
    getFunction(pid, fid, MAX_THREADS_PRE_GET, cursor).then(threads => {
        //將資料轉為 JSON 並發送
        threads = threads.map( t => t.toJSON() )
        res.send(threads)
    }).catch(e => {
        res.status(400).send(e)
    })
}

/** @type {RouteFunction} */
export function postThread(req, res) {
    
}

/** @type {RouteFunction} */
export function getThread(req, res) {
    
}


/** @type {RouteFunction} */
export function searchThread(req, res) {
    
}


