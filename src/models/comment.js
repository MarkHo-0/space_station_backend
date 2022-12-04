import { SimpleUser } from "./user.js"

export class Comment {
    id = -1
    content = ''
    /** @type {SimpleUser} */
    sender = null
    create_time = 0
    like_count = 0
    dislike_count = 0
    reply_count = 0
    /** @type {Comment | undefined} */
    reply_to = null
    my_reation = 0

    constructor(comment_id, content, sender, create_time, like_count, dislike_count, reply_to, my_reation) {
        this.id = comment_id
        this.content = content
        this.sender = sender
        this.create_time = create_time
        this.like_count = like_count
        this.dislike_count = dislike_count
        this.reply_to = reply_to
        this.my_reation = my_reation
    }

    toJSON(isSimple = false) {
        const json = {
            cid: this.id,
            content: this.content,
            create_time: this. create_time,
            sender: this.sender.toJSON()
        }

        if (!isSimple) {
            if (this.reply_to) {
                json['reply_to'] = this.reply_to.toJSON(true)    
            }            
            json['stats'] = {
                like: this.like_count,
                dislike: this.dislike_count,
                me: this.my_reation
            }
        }

        return json
    }
}

export function commentFromDB(d) {
    //TODO: 將資料庫格式轉為JavaScript對象
    return new Comment()
}