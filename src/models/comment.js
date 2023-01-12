import { jsDate2unixTime } from "../utils/parseTime.js"
import { SimpleUser } from "./user.js"

export class Comment {
    constructor({id, tid, content, sender, create_time, like_count, dislike_count, reply_count, replyto_cid, status, user_reation}) {
        /** @type {number} */ this.id = id || 0
        /** @type {number} */ this.parentThreadID = tid || 0
        /** @type {String} */ this.content = content || ""
        /** @type {SimpleUser} */ this.sender = sender || new SimpleUser()
        /** @type {Date} */ this.createTime = create_time || new Date()
        /** @type {number} */ this.likeCount = like_count || 0
        /** @type {number} */ this.dislikeCount = dislike_count || 0
        /** @type {number} */ this.replyCount = reply_count || 0
        /** @type {number | null} */ this.replytoCommentID = replyto_cid || null
        /** @type {Comment | null} */ this.replytoComment = null
        /** @type {number} */ this.status = status || COMMENT_STATUS.NORMAL
        /** @type {number} */ this.userReation = user_reation || COMMENT_REACTION_TYPE.NONE
    }

    get isHidden() {
      return this.status > COMMENT_STATUS.MAYBE_PROBLEMATIC
    }

    isBelongTo(thread) {
      return this.parentThreadID === thread.id
    }

    get isManualReviewed() {
      return this.status == COMMENT_STATUS.MANUALLY_NORMAL || this.status == COMMENT_STATUS.MANUALLY_HIDDENT
    }

    setReplyToModel(comment) {
      if (comment == null) return
      this.replytoComment = comment
    }

    get simplifiedStatus() {
      if (this.status < COMMENT_STATUS.MAYBE_PROBLEMATIC) return 0
      if (this.status > COMMENT_STATUS.MAYBE_PROBLEMATIC) return 2
      return 1
    }

    toJSON() {
      return {
          cid: this.id,
          content: this.simplifiedStatus < 2 ? this.content : '',
          create_time: jsDate2unixTime(this.createTime),
          sender: this.sender.toJSON(),
          stats: {
              like: this.likeCount,
              dislike: this.dislikeCount,
              reply: this.replyCount,
              me: this.userReation
          },
          reply_to: this.replytoComment ? this.replytoComment.toJSON() : this.replytoCommentID,
          status: this.simplifiedStatus
      }
    }

    static fromDB(d) {
      return new this({
        id: d['cid'],
        tid: d['tid'],
        content: d['content'],
        sender: new SimpleUser(d['sender_uid'], d['nickname']),
        create_time: new Date(d['create_time']),
        like_count: d['like_count'],
        dislike_count: d['dislike_count'],
        reply_count: d['reply_count'],
        replyto_cid: d['replyto_cid'],
        status: d['status'],
        user_reation: d['reaction_type']
      })
    }
}

/** @readonly @enum {number} */
export const COMMENT_STATUS = {
  NORMAL: 0,
  MANUALLY_NORMAL: 1,
  MAYBE_PROBLEMATIC: 2,
  AUTO_HIDDENT: 3,
  MANUALLY_HIDDENT: 4
}

/** @readonly @enum {number} */
export const COMMENT_REACTION_TYPE = {
  NONE: 0,
  LIKE: 1,
  DISLIKE: 2
}