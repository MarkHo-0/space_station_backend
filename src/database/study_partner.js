import { Course } from "../models/course.js";
import { StudyPartnerPost } from "../models/study_partner_post.js";
import { getDB } from "./index.js";

export class StudyPartner {
    constructor(connection) {
        /** @type {import('mysql2/promise').Pool} @private */
        this.db = connection
    }

    async createPost(user, course, aimed_grade, description, contact) {
      await this.db.execute(
          "INSERT INTO study_partner_posts (`publisher_uid`, `contact_method`, `contact_detail`, `course_code`, `aimed_grade`,`description`) VALUE (?, ?, ?, ?, ?, ?)", 
          [user.user_id, contact.method, contact.detail, course.code, aimed_grade, description]
      )
      return true
    }

    /** @returns { Promise<Array<StudyPartnerPost>> }*/
    async getPosts(keyword, quantity = 10, cursor) {
      let kewordFilter = '';
      if (keyword != null) {
        let courseFilter = ''
        const courses = await getDB().course.queryMany(keyword);
        if (courses.length > 0) {
          courseFilter = ` OR p.course_code IN (${courses.map(c => `'${c.code}'`).join(',')})`
        }
        kewordFilter = ` (p.description LIKE '%${keyword}%'${courseFilter}) AND`
      }
      
      const [raw_posts, _] = await this.db.execute(
        `SELECT * FROM study_partner_posts p, courses c WHERE${kewordFilter} p.course_code = c.code ORDER BY publish_time DESC LIMIT ? OFFSET ?`,
        [quantity.toString(), cursor.offset.toString()]
      );

      return raw_posts.map(p => StudyPartnerPost.fromDB(p))
    }

    async removePost(publish_id) {
      await this.db.execute("DELETE FROM study_partner_posts WHERE `id` = ?", [publish_id])
      return;
    } 

    async isPostBelongsToUser(post_id, user) {
      if (Number.isInteger(post_id) == false) return false
      const [post, _] = await this.db.execute(
        "SELECT `id` FROM study_partner_posts WHERE `id` = ? AND `publisher_uid` = ?",
        [post_id, user.user_id]
      )
      return post.length == 1
    }

    async editPost(post_id, course, aimed_Grade, description, contact) {
      await this.db.execute(
        "UPDATE study_partner_posts SET `course_code` = ?, `aimed_grade` = ?, `description` = ?, `contact_method` = ?, `contact_detail` = ? WHERE `id` = ?", 
        [course.code, aimed_Grade, description, contact.method, contact.detail, post_id]
      )
      return;
    }

     /** @returns { Promise<Array<StudyPartnerPost>> }*/
    async getPostsByUser(user) {
      const [raw_posts,_] = await this.db.execute(
        "SELECT * FROM study_partner_posts p, courses c WHERE p.publisher_uid = ? AND p.course_code = c.code",
        [user.user_id]
      )
      return raw_posts.map(p => StudyPartnerPost.fromDB(p))
    }
}