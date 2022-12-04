import { SimpleUser } from "./user.js"
import { Comment } from "./comment.js"
export class Thread {
    id = 0
    title = ''
    /** @type {Comment} */
    content = null
    /** @type {SimpleUser} */
    sender = null
    page_id = 0
    faculty_id = 0
    create_time = 0
    last_update_time = 0
    /** @type {Comment | undefined} */
    pinned_comment = null

    constructor(id, title, content, ) {
        this.id = id
        this.title = title
    }

    get stats() {
        return {
            like: this.content.like_count,
            dislike: this.content.dislike_count,
            reply: this.content.reply_count
        }
    }

    toJSON() {
        const json = {
            tid: this.id,
            pid: this.page_id,
            fid: this.faculty_id,
            title: this.title,
            content_cid: this.content.id,
            create_time: this.create_time,
            last_update_time: this.last_update_time,
            stats: this.stats,
            sender: this.sender.toJSON()
        }

        if (this.pinned_comment) {
            json['pined_cid'] = this.pinned_comment.id
        }

        return json
    }
}

export function threadFormDB(d) {
    
    return new Thread()
}
