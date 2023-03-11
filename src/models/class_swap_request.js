import { jsDate2unixTime } from '../utils/parseTime.js'
import { ContactInfo } from './contactInfo.js'
import { Course } from './course.js'

export class ClassSwapRequest {
  constructor({ swap_id, course, requester_uid, current_class_num, expected_class_num, responser_uid, contact}) {
    /** @type {number} */ this.id = swap_id
    /** @type {Course} */ this.course = course
    /** @type {number} */ this.requesterUID = requester_uid
    /** @type {number} */ this.currentClassNum = current_class_num
    /** @type {number} */ this.expectedClassNum = expected_class_num
    /** @type {number | null} */ this.responserUID = responser_uid
    /** @type {ContactInfo} */ this.contact = contact
  }

  get isSwapped() {
    return this.responserUID != null
  }

  isRequestBy(user) {
    return this.requesterUID == user.user_id
  }

  static fromDB(d) {
    return new ClassSwapRequest({
      swap_id: d['id'],
      course: Course.fromDB(d),
      current_class_num: d['current_class'],
      expected_class_num: d['expected_class'],
      requester_uid: d['requester_uid'],
      responser_uid: d['responser_uid'],
      contact: new ContactInfo(d['contact_method'], d['contact_detail'])
    })
  }

  toJSON() {
     return {
      id: this.id,
      course: this.course.toJSON(),
      current_class_num: this.currentClassNum,
      expected_class_num: this.expectedClassNum,
      requester_uid: this.requesterUID,
      responser_uid: this.responserUID,
      contact: this.contact.toJSON()
     }
  }
}