import { ContactInfo } from "./contactInfo.js"
import { getCurrentUnixTime } from "../utils/parseTime.js"

export class Course {
  constructor({ course_name, course_code, min_class_num, max_class_num }) {
    /** @type {String} */ this.code = course_code
    /** @type {String} */ this.name = course_name 
    /** @type {number} */ this.minClassNum = min_class_num
    /** @type {number} */ this.maxClassNum = max_class_num
  }

  isClassValid(class_num) {
    return class_num >= this.minClassNum && class_num <= this.maxClassNum
  }
     
  static fromDB(d) {
    //TODO
    return new Course()
  }

  toJSON() {
    //TODO
    return {}
  }
}

export class ClassSwapRequest {
  constructor({ swap_id, course_code, requester_uid, current_class_num, request_class_num, request_on, responser_uid, response_on, contact}) {
    /** @type {number} */ this.id = swap_id
    /** @type {string} */ this.courseCode = course_code
    /** @type {number} */ this.requesterUID = requester_uid
    /** @type {number} */ this.currentClassNum = current_class_num
    /** @type {number} */ this.requestClassNum = request_class_num
    /** @type {number} */ this.requestOn = request_on || getCurrentUnixTime()
    /** @type {number} */ this.responserUID = responser_uid || 0
    /** @type {number} */ this.responseOn = response_on || 0
    /** @type {ContactInfo} */ this.contact = contact
  }

  get isSwapped() {
    return this.responserUID > 0 && this.responseOn > 0
  }

  static fromDB(d) {
    //TODO
    return new ClassSwapRequest()
  }

  toJSON() {
     //TODO
     return {}
  }
}