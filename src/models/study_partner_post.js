import { jsDate2unixTime } from '../utils/parseTime.js'
import { ContactInfo } from './contactInfo.js'
import { Course } from './course.js'

export class StudyPartnerPost {
    constructor({publish_id, publisher_uid, contact, course, aimed_grade, description}) {
    /** @type {number} */ this.id = publish_id
    /** @type {number} */ this.publisherUID = publisher_uid
    /** @type {Course} */ this.course = course
    /** @type {number} */ this.aimedGrade = aimed_grade
    /** @type {String} */ this.description = description
    /** @type {ContactInfo} */ this.contact = contact
    }

    isPublishBy(user){
      return this.publisherUID == user.user_id
    }

    get hasID() {
      return this.id > 0
    }

    static fromDB(d) {
      return new StudyPartnerPost({
        publish_id: d['id'],
        publisher_uid: d['publisher_uid'],
        contact: new ContactInfo(d['contact_method'], d['contact_detail']),
        course: Course.fromDB(d),
        aimed_grade: d['aimed_grade'],
        description: d['description']
      })
    }

    toJSON() {
      return {
        id: this.id,
        publisher_uid: this.publisherUID,
        course: this.course.toJSON(),
        aimed_grade: this.aimedGrade,
        description: this.description,
        contact: this.contact.toJSON()
      }
    }
}