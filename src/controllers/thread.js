import { RouteFunction } from '../types/express.js'
import { Thread } from '../models/thread.js';
import { Comment } from '../models/comment.js';

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

export function getThreadByID(req, res) {

}

export function getComments(req, res) {
    const tid = req.query("tid")
    const cursor = req.params("cursor")


    if (typeof cursor != 'string' || cursor < 1) cursor = null
    if (typeof tid != 'number' ) return res.status(400).send()

    


}


