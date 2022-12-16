import { validateCommentData } from '../utils/dataValidation.js';

/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

/** @type {RouteFunction} */
export async function postComment(req, res) {
  //校驗參數
  const { tid, reply_to, content} = validateCommentData(req.body)
  if (!tid || !content) return res.status(422).send()

  //檢查所回復的貼文是否存在或可用
  const parent_thread = await req.db.thread.getOne(tid)
  if (!parent_thread || parent_thread.isHidden) {
    return res.status(400).send({ reason_id: COMMENT_ERROR.THREAD_UNAVAILABLE })
  }

  if (reply_to !== null) {
    const parent_comment = await req.db.comment.getOne(reply_to)
    //檢查所回復的留言是否存在或可用
    if (!parent_comment || parent_comment.isHidden) {
      return res.status(400).send({ reason_id: COMMENT_ERROR.REPLYTO_UNAVAILABLE })
    }
    //檢查該留言是否屬於用戶所提供的貼文下
    if (!parent_comment.isBelongTo(parent_thread)) {
      return res.status(400).send({ reason_id: COMMENT_ERROR.REPLYTO_IN_OTHER_THREAD })
    }
  }

  //將留言寫入資料庫
  req.db.comment.createNew(content, tid, req.user.user_id, reply_to)
    .then(new_cid => res.send({"new_cid": new_cid}))
    .catch(_ => res.status(400).send({ reason_id: COMMENT_ERROR.UNKNOWN }))
}

/** @type {RouteFunction} */
export function getComment(req, res) {

}

/** @type {RouteFunction} */
export function reactComment(req, res) {
    let cid = parseInt(req.path['cid'])
    let cr_type = parseInt (req.parms['type'])

    if ( isNaN(cid) ) 
        return res.status(400).send()

    if ( isNaN(cr_type) || cr_type !== 0 || cr_type !== 1)
        return res.status(400).send()

}

/** @type {RouteFunction} */
export function pinOrUnpinComment(req, res) {
    
}

/** @type {RouteFunction} */
export function reportComment(req, res) {

}

/** @readonly @enum {number} */
const COMMENT_ERROR = {
  UNKNOWN: 0,
  THREAD_UNAVAILABLE: 1,
  REPLYTO_UNAVAILABLE: 2,
  REPLYTO_IN_OTHER_THREAD: 3
}