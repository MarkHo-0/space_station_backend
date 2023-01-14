import { Thread } from '../models/thread.js';
import { Comment } from '../models/comment.js';
import { FACULTY, FORUM_PAGE, validateThreadData, validateThreadQueryData, validateCursor, validateThreadViewData} from '../utils/dataValidation.js';
import { TimebasedCursor } from '../utils/pagination.js';

/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

const MAX_THREADS_PRE_GET = 15;
const MAX_COMMENTS_PRE_GET = 15;
const MIN_RECORD_VIEW_TIME = 5;

/** @type {RouteFunction} */
export async function getThreads(req, res) {
  //校驗參數
  let { pid, fid, query, order, cursor_base64 } = validateThreadQueryData(req.query)

  //如果是吹水臺，則無需科系編號
  if (pid == FORUM_PAGE.CASUAL) fid = 0

  //解析分頁數據
  const cursor = TimebasedCursor.fromBase64(cursor_base64)
  
  //選擇合適的排序函數，執行該函數獲取貼文編號列表
  const orderingFunction = [req.db.thread.getNewestIndexes, req.db.thread.getHeatestIndexes]
  const threads_id = await orderingFunction[order - 1].call(req.db.thread, pid, fid, query, MAX_THREADS_PRE_GET, cursor)

  //獲取貼文資料並返回
  req.db.thread.getMany(threads_id)
    .then(threads => res.send({
      "threads": threads.map(t => t.toJSON()),
      "continuous": threads_id.length < MAX_THREADS_PRE_GET ? '' : cursor.increaseOffset(threads.length).toBase64()
    }))
    .catch(_ => res.status(400).send(_))
}

/** @type {RouteFunction} */
export function postThread(req, res) {
  //校驗參數
  let { pid, fid, title, content } = validateThreadData(req.body)
  if (pid == null || fid == null || !title || !content) {
    return res.status(422).send()
  }

  //如果發佈在學術臺，必須有學系編號，否則返回錯誤
  if (pid == FORUM_PAGE.ACADEMIC && fid == FACULTY.NONE_OR_ALL) {
    return res.status(422).send()
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
  //校驗參數
  const thread_id = req.target.thread.id
  const cursor_base64 = validateCursor(req.query['cursor'])
  const user_id = req.user?.user_id || 0

  //解析分頁數據
  const cursor = TimebasedCursor.fromBase64(cursor_base64)

  //返回數據
  req.db.comment.getManyByTID(thread_id, user_id, 1, MAX_COMMENTS_PRE_GET, cursor)
    .then(comments => {
      const shouldIncludeThreadDetail = cursor.offset == 0
      const result = {
        'comments': comments.map( c => c.toJSON()),
        'continuous': comments.length < MAX_COMMENTS_PRE_GET ? '' : cursor.increaseOffset(comments.length).toBase64()
      }

      //如果是第一頁，才會加入貼文詳情
      if (shouldIncludeThreadDetail) {
        result['thread'] = req.target.thread.toJSON()
      }

      res.send(result)
    })
    .catch( _ => res.status(400).send(_))
}

/** @type {RouteFunction} */
export async function viewThread(req, res) {
  //校验參數
  const {thread_id, view_time} = validateThreadViewData(req.body)
  if (!thread_id || !view_time) return res.status(422).send()

  //驗證貼文是否可讀
  const thread = await req.db.thread.getOne(thread_id)
  if (!thread || thread.isHidden) return res.status(404).send()

  //如果是貼文擁有者點擊，則不納入紀錄
  if (req.user.user_id == thread.sender.user_id) return res.send()

  //驗證是否符合最低紀錄時間
  if (view_time < MIN_RECORD_VIEW_TIME) res.send()

  //寫入資料庫
  req.db.thread.createViewLog(thread_id, req.user.user_id, view_time)
    .finally(() => res.send())
}


