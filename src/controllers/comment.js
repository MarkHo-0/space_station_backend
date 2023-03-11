import { COMMENT_REACTION_TYPE, COMMENT_STATUS } from '../models/comment.js';
import { USER_ACTION } from '../models/user.js';
import { validateCommentData, validateReportReason, validateRreactionType } from '../utils/dataValidation.js';

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
export async function reactComment(req, res) {
  const new_reaction = validateRreactionType(req.query['type'])
  if(!new_reaction) return res.status(422).send()

  const comment_id = req.target.comment.id
  const old_reaction = req.target.comment.userReation
  const user_id = req.user.user_id

  if (old_reaction !== COMMENT_REACTION_TYPE.NONE) {
    //如果用戶曾經已互動，則先刪除舊有的互動紀錄
    await req.db.comment.removeReaction(comment_id, user_id).then(_ => {})

    //檢查是否需要新增互動，如否則返回
    if (new_reaction == old_reaction) {
      return res.send({"new_reaction": 0})
    }
  }
  
  //寫入新的互動紀錄
  req.db.comment.createReaction(comment_id, user_id, new_reaction)
    .then(_ => res.send({new_reaction}))
    .catch(_ => res.status(400).send('UNKNOWN ERROR'))
}

/** @type {RouteFunction} */
export async function pinOrUnpinComment(req, res) {
  const target_comment_id = req.target.comment.id
  const parent_thread_id = req.target.comment.parentThreadID

  //檢查貼文是否仍然可用
  const parent_thread = await req.db.thread.getOne(parent_thread_id) 
  if (!parent_thread || parent_thread.isHidden) {
    return res.status(404).send()
  }

  //檢查操作用戶是否為貼文擁有者
  if (parent_thread.sender.user_id !== req.user.user_id) {
    return res.status(403).send()
  }

  let new_pin = null;

  //若新的留言編號和舊的頂置編號一致，則代表用戶移除頂置，相反則更新頂置
  if (parent_thread.pinedCommentID == target_comment_id) {
    await req.db.comment.removePinned(parent_thread_id)
  } else {
    await req.db.comment.setPinned(parent_thread_id, target_comment_id)
    new_pin = target_comment_id
  }

  //完成，返回用戶
  res.send({'new_pin': new_pin})
}

const HIDDEN_THRESHORD = 3
const PROBLEMATIC_THRESHORD = 2
const ANTO_BAN_THRESHORD = 5

/** @type {RouteFunction} */
export async function reportComment(req, res) {
  const reason_id = validateReportReason(req.body['reason_id'])
  if (!reason_id) return res.status(422).send()

  const target_id = req.target.comment.id
  const reporter_id = req.user.user_id

  //如用戶曾經已舉報過該則留言，則返回
  if (await req.db.comment.isUserReported(target_id, reporter_id)) {
    return res.status(460).send('You have already reported')
  }

  //將舉報資料寫入資料庫
  await req.db.comment.createReport(target_id, reason_id, reporter_id)

  //如該則留言已經過人工審查，則不再進行系統審查，直接返回用戶
  if (req.target.comment.isManualReviewed) return res.send()
  
  //獲取留言的總舉報數量
  const reported_count = await req.db.comment.getReportsCount(target_id)

  //按情況將留言標示為可能存在問題，或直接屏蔽
  if (reported_count >= HIDDEN_THRESHORD) {
    await req.db.comment.updateStatus(target_id, COMMENT_STATUS.AUTO_HIDDENT)
    
    const comment_sender = req.target.comment.sender.user_id
    const banned_count = await req.db.comment.countHidden(comment_sender)
    if (banned_count >= ANTO_BAN_THRESHORD) {
      await req.db.user.createBanRecord(comment_sender, USER_ACTION.USE_FORUM, 30)
    }

  } else if (reported_count >= PROBLEMATIC_THRESHORD) {
    await req.db.comment.updateStatus(target_id, COMMENT_STATUS.MAYBE_PROBLEMATIC)
  }

  //完成，返回用戶
  res.send()
}

/** @readonly @enum {number} */
const COMMENT_ERROR = {
  UNKNOWN: 0,
  THREAD_UNAVAILABLE: 1,
  REPLYTO_UNAVAILABLE: 2,
  REPLYTO_IN_OTHER_THREAD: 3
}