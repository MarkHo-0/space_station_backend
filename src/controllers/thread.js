import {RouteFunction} from '../types/express.js'
import { Thread } from '../models/thread.js';

const MAX_THREADS_PRE_GET = 15;

/** @type {RouteFunction} */
export function getThreads(req, res) {
    const {cursor, order, pid, fid} = req.params

    //參數校驗
    if (typeof cursor != 'string' || cursor < 1) cursor = null
    if (typeof order != 'number' || order < 0 || order > 1) order = 0
    if (typeof pid != 'number' || pid < 0 || pid > 1) pid = 0
    if (typeof fid != 'number' || fid < 0) fid = 0

    /** @type {Promise<Thread[]>} */
    let getFunction;

    //是按熱度還是按發文時間先後搜尋
    if (order == 0) {
        getFunction = req.db.thread.getHeatestWithParams(pid, fid, MAX_THREADS_PRE_GET, cursor)
    } else {
        getFunction = req.db.thread.getNewestWithParams(pid, fid, MAX_THREADS_PRE_GET, cursor)
    }

    //執行資料庫查詢
    getFunction.then(threads => {
        //將資料轉為 JSON 並發送
        threads = threads.map( t => t.toJSON() )
        res.send(threads)
    }).catch(e => {
        res.status(400).send(e)
    })
}

export function getThreadByID(req, res) {

}

