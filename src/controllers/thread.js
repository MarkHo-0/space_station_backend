import { Thread } from '../models/thread.js';
import { Comment } from '../models/comment.js';
import { FACULTY, FORUM_PAGE, validateThreadData, validateThreadQueryData } from '../utils/dataValidation.js';

/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

const MAX_THREADS_PRE_GET = 15;
const MAX_COMMENTS_PRE_GET = 15;

/** @type {RouteFunction} */
export async function getThreads(req, res) {
  //校驗參數
  let { pid, fid, order, cursor_base64 } = validateThreadQueryData(req.query)

  //如果是吹水臺，則無需科系編號
  if (pid == FORUM_PAGE.CASUAL) fid = 0

  //選擇合適的排序函數，執行該函數獲取貼文編號列表
  const orderingFunction = [req.db.thread.getNewestIndexes, req.db.thread.getHeatestIndexes]
  const { threads_id, cursor } = await orderingFunction[order - 1].call(req.db.thread, pid, fid, MAX_THREADS_PRE_GET, cursor_base64)

  //獲取貼文資料並返回
  req.db.thread.getMany(threads_id)
    .then(threads => res.send({
      "threads": threads.map(t => t.toJSON()),
      "cursor": btoa(JSON.stringify(cursor))
    }))
    .catch(_ => res.status(400).send())
}

/** @type {RouteFunction} */
export function postThread(req, res) {
  //校驗參數
  let { pid, fid, title, content } = validateThreadData(req.body)
  if (pid == null || fid == null || !title || !content) {
    res.status(422).send()
  }

  //如果發佈在學術臺，必須有學系編號，否則返回錯誤
  if (pid == FORUM_PAGE.ACADEMIC && fid == FACULTY.NONE_OR_ALL) {
    res.status(422).send()
  }

  //如果發佈在吹水臺，則無需科系編號
  if (pid == FORUM_PAGE.CASUAL) fid = null

  //寫入資料庫，若成功返回新貼文的編號
  req.db.thread.createNew(title, content, req.user.user_id, pid, fid)
    .then(tid => res.send({new_tid: tid}))
    .catch(e => res.status(400).send(e))
}

/** @type {RouteFunction} */
export function getThread(req, res) {
    
}


/** @type {RouteFunction} */
export function searchThread(req, res) {
    
}


