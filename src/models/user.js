import { jsDate2unixTime } from "../utils/parseTime.js"

export class User{
  constructor({id, nickname, student_id, faculty_id, create_time, thread_count, comment_count}) {
    /** @type {number} */ this.userID = id
    /** @type {string} */ this.nickname = nickname
    /** @type {number} */ this.studentID = student_id
    /** @type {number | null} */ this.facultyID = faculty_id
    /** @type {Date} */ this.createTime = create_time
    /** @type {number} */ this.threadCount = thread_count
    /** @type {number} */ this.commentCount = comment_count
  }

  static fromDB(d) {
    return new User({
      id: d["uid"],
      nickname: d["nickname"],
      student_id: d["sid"],
      faculty_id: d["fid"],
      create_time: new Date(d["create_time"]),
      thread_count: d["thread_count"],
      comment_count: d["comment_count"]
    })
  }

  toJSON(hideSensitiveData = true) {
    return {
      uid: this.userID,
      nickname: this.nickname,
      create_time: jsDate2unixTime(this.createTime),
      sid: hideSensitiveData ? null : this.studentID,
      fid: this.facultyID,
      thread_count: this.threadCount,
      comment_count: this.commentCount
    }
  }
}

export class SimpleUser {
    constructor(user_id, nickname) {
        /** @type {number} */ this.user_id = user_id || 0
        /** @type {string} */ this.nickname = nickname || ''
    }

    toJSON() {
        return {
            uid: this.user_id,
            nickname: this.nickname
        }
    }

    static fromDB(d) {
        return new SimpleUser(d['uid'], d['nickname'])
    }
}

/** @readonly @enum {number} */
export const USER_ACTION = {
    LOGIN: 0,
    USE_FORUM: 1,
    USE_TOOLBOX: 2,
    UPDATE_PROFILE: 3
}