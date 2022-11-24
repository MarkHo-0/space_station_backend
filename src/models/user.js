export class User{
    id = -1
    /** @type {SimpleUser} */
    basic_info = null
    gender_id = 1
    student_id = -1
    faculty_id = -1
    create_time = 0
    thread_count = 0
    comment_count = 0
    
    constructor(id, nickname, gender_id, student_id, faculty_id, create_time) {
        this.basic_info = new SimpleUser(id, nickname)
        this.gender_id = gender_id
        this.student_id = student_id
        this.faculty_id = faculty_id
        this.create_time = create_time
    }

    get nickname() {
        return this.basic_info.nickname
    }

    get user_id() {
        return this.basic_info.user_id
    }

    toJSON() {
        return {
            basic_info: this.basic_info.toJSON(),
            gender: this.gender_id,
            create_time: this.create_time,
            sid: this.create_time,
            fid: this.faculty_id,
            thread_count: this.thread_count,
            comment_count: this.thread_count
        }
    }
}

export class SimpleUser {
    user_id = ''
    nickname = ''

    constructor(user_id, nickname) {
        this.user_id = user_id
        this.nickname = nickname
    }

    toJSON() {
        return {
            uid: this.user_id,
            nickname: this.nickname
        }
    }
}