import { Course } from "../models/course";
import { StudyPartnerPost } from "../models/study_partner_post";

export class StudyPartner {
    constructor(connection) {
        /** @type {import('mysql2/promise').Pool} @private */
        this.db = connection
    }

    async createPost(publish_id, publisher_uid, contact, course, aimed_Grade, discription) {
        await this.db.execute (
          "INSERT INTO class_swap_requests (`publish_id`, `publisher_uid`, `contact_method`, `contact_detail`, `course_code`, `aimed_Grade`,`discription`) VALUE (?, ?, ?, ?, ?, ?)", 
          [publish_id, publisher_uid, contact.method, contact.detail, course.course_code, aimed_Grade, discription]
        )
        return true
      }

    async searchPost(keyword){
        return true
    }

    async removePost(publish_id) {
        await this.db.execute ("DELETE FROM study_partner_posts WHERE `id` = ?", [publish_id])
        return true
    }   

    async editPost(contact, course, aimed_Grade, discription) {
        await this.db.execute ("UPDATE FROM study_parnter_posts (`contact_method`, `contact_detail`, `course`, `aimed_Grade`, `discription`) VALUES(?, ?, ?, ?) WHERE publish_id = ? ", [contact.method, contact.detail, course, aimed_Grade, discription])
    }
}