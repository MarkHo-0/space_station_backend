import { SimpleUser } from "./user.js"
import { Comment } from "./comment.js"
import { jsDate2unixTime } from "../utils/parseTime.js"
export class Thread {
    constructor({id, pid, fid, title, content_cid, create_time, last_update_time, sender, stats, pinned_cid, status}) {
        /** @type {number} */ this.id = id
        /** @type {number} */ this.pageID = pid
        /** @type {number} */ this.facultyID = fid
        /** @type {Date} */ this.createTime = create_time
        /** @type {Date} */ this.lastUpdateTime = last_update_time
        /** @type {String} */ this.title = title
        /** @type {SimpleUser} */ this.sender = sender
        /** @type {number} */ this.status = status
        /** @type {number} */ this.contentCommentID = content_cid
        /** @type {number | null} */ this.pinedCommentID = pinned_cid
        this.stats = stats
    }

    toJSON() {
        const json = {
            tid: this.id,
            pid: this.pageID,
            fid: this.facultyID,
            title: this.title,
            content_cid: this.contentCommentID,
            sender: this.sender.toJSON(),
            create_time: jsDate2unixTime(this.createTime),
            last_update_time: jsDate2unixTime(this.lastUpdateTime),
            stats: this.stats
        }

        if (this.pinedCommentID) {
            json['pined_cid'] = this.pinedCommentID
        }

        return json
    }

    get isHidden() {
      return this.status > 3
    }
}

export function threadFormDB(d) {  
  return new Thread({
    id: d['tid'],
    pid: d['pid'],
    fid: d['fid'],
    title: d['title'],
    create_time: new Date(d['create_time']),
    last_update_time: new Date(d['last_update_time']),
    sender: new SimpleUser(d['sender_uid'], d['nickname']),
    stats: {
      like: d['like_count'],
      dislike: d['dislike_count'],
      comment: d['comment_count']
    },
    content_cid: d['content_cid'],
    pinned_cid: d['pined_cid'],
    status: d['status']
  })
}
