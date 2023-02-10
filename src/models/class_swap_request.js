import { jsDate2unixTime } from '../utils/parseTime'
import { ContactInfo } from './contactInfo'

export class ClassSwapRequest {
  constructor({ swap_id, course_code, requester_uid, current_class_num, expected_class_num, request_on, responser_uid, response_on, contact}) {
    /** @type {number} */ this.id = swap_id
    /** @type {string} */ this.courseCode = course_code
    /** @type {number} */ this.requesterUID = requester_uid
    /** @type {number} */ this.currentClassNum = current_class_num
    /** @type {number} */ this.expectedClassNum = expected_class_num
    /** @type {Date} */ this.requestOn = request_on
    /** @type {number | null} */ this.responserUID = responser_uid || 0
    /** @type {Date | null} */ this.responseOn = response_on
    /** @type {ContactInfo} */ this.contact = contact
  }

  get isSwapped() {
    return this.responserUID > 0 && this.responseOn > 0
  }

  get hasID() {
    return this.id > 0
  }

  isRequestBy(user) {
    return this.requesterUID == user.id
  }

  static fromDB(d) {
    const swapped = d['responser_uid'] != null
    return new ClassSwapRequest({
      swap_id: d['id'],
      course_code: d['course_code'],
      current_class_num: d['current_class_num'],
      expected_class_num: d['expected_class_num'],
      requester_uid: d['requester_uid'],
      request_on: new Date(d['request_on']),
      responser_uid: swapped ? d['responser_uid'] : null,
      response_on: swapped ? new Date(d['response_on']) : null,
      contact: new ContactInfo(d['contact_method'], d['contact_detail'])
    })
  }

  toJSON() {
     return {
      id: this.id,
      course_code: this.courseCode,
      current_class_num: this.currentClassNum,
      expected_class_num: this.expectedClassNum,
      requester_uid: this.requesterUID,
      request_on: jsDate2unixTime(this.requestOn),
      responser_uid: this.responserUID,
      response_on: jsDate2unixTime(this.responseOn),
      contact: this.contact.toJSON()
     }
  }
}