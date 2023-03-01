import { Course } from "../models/course.js";
import { StudyPartnerPost } from "../models/study_partner_post.js";

export class StudyPartner {
    constructor(connection) {
        /** @type {import('mysql2/promise').Pool} @private */
        this.db = connection
    }

    async createPost(user, course, aimed_Grade, discription, contact) {
        await this.db.execute (
            "INSERT INTO class_swap_requests (`publisher_uid`, `contact_method`, `contact_detail`, `course_code`, `aimed_Grade`,`discription`) VALUE (?, ?, ?, ?, ?, ?)", 
            [user.user_id, contact.method, contact.detail, course.course_code, aimed_Grade, discription]
        )
        return true
    }

    /**
     * @param { String } keyword 
     * @param { Array<Course> } courses 
     * @returns { Promise<StudyPartnerPost> }
     */
    async searchPosts(keyword, courses) {
        const course_codes = '(' + courses.map(c => c.code).join(',') + ')'
        const [raw_posts, _] = await this.db.execute("SELECT * FROM study_partner_posts WHERE (? = '()' OR course_code IN ?) OR discription LIKE %?%", [course_codes, course_codes, keyword]);

        return raw_posts.map(p => StudyPartnerPost.fromDB(p))
    }

    async removePost(publish_id) {
        await this.db.execute ("DELETE FROM study_partner_posts WHERE `id` = ?", [publish_id])
        return true
    }   

    async getPost(publish_id) {
        const [raw,_] = await this.db.execute ("SELECT * FROM study_partner_posts WHERE `id` = ?",[publish_id])
        return StudyPartnerPost.fromDB(raw)
    }
    async editPost(contact, course, aimed_Grade, discription) {
        await this.db.execute ("UPDATE FROM study_partner_posts (`contact_method`, `contact_detail`, `course`, `aimed_Grade`, `discription`) VALUES(?, ?, ?, ?) WHERE publish_id = ? ", [contact.method, contact.detail, course, aimed_Grade, discription])
    }
}