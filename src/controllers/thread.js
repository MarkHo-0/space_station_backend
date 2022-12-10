import { Thread } from '../models/thread.js';
import { Comment } from '../models/comment.js';

/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

const MAX_THREADS_PRE_GET = 15;
const MAX_COMMENTS_PRE_GET = 15;

/** @type {RouteFunction} */
export async function getThreads(req, res) {
  let {cursor, order, pid, fid} = req.params

  //參數校驗
  if (typeof cursor != 'string' || cursor < 1) cursor = 0
  if (typeof order != 'number' || order < 0 || order > 1) order = 0
  if (typeof pid != 'number' || pid < 0 || pid > 1) pid = 0
  if (typeof fid != 'number' || fid < 0) fid = 0

  //選擇合適的排序函
  const indexingFunc = order == 0 ? req.db.thread.getHeatestIndexes : req.db.thread.getNewestIndexes
  //執行該函數獲取貼文編號列表
  const threadsIndexes = await indexingFunc.call(req.db.thread, pid, fid, MAX_THREADS_PRE_GET, cursor)

  //獲取貼文資料並返回
  req.db.thread.getMany(threadsIndexes).then(threads => {
    //將資料轉為 JSON 並發送
    res.send(threads.map(t => t.toJSON()))
  }).catch(_ => res.status(400).send())
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


