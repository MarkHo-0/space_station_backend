import { ContactInfo, C_METHOD } from '../models/contactInfo.js'

export function validateRegisterData({sid, nickname, pwd}) {
  return {
    "sid": validateSID(sid),
    "nickname": validateNickname(nickname),
    "pwd": validateHashedPassword(pwd)
  }
}

export function validateLoginData({sid, pwd, device_name}) {
  return {
    "sid": validateSID(sid),
    "pwd": validateHashedPassword(pwd),
    "device_name": validateDeviceName(device_name)
  }
}

export function validateThreadData({pid, fid, title, content}) {
  return {
    "pid": validatePageID(pid),
    "fid": validateFacultyID(fid),
    "title": validateThreadTitle(title),
    "content": validateContent(content)
  }
}

export function validateThreadQueryData({pid, fid, order, q, cursor}) {
  return {
    "pid": validatePageID(pid) || 0,
    "fid": validateFacultyID(fid) || 0,
    "query": validateThreadQueryText(q) || '',
    "order": validateThreadOrder(order) || THREAD_ORDER.BY_TIME,
    "cursor_base64": validateCursor(cursor)
  }
}


export function validateThreadViewData({tid, view_time}) {
  return {
    'thread_id': validateNonNegativeInt(tid),
    'view_time': validateNonNegativeInt(view_time)
  }
}

export function validateCommentData({tid, reply_to, content}){
  return {
    "tid": validatePositiveInt(tid),
    "reply_to": validatePositiveInt(reply_to),
    "content": validateContent(content)
  }
}

export function validateStudyPartnerPostData({course_code, aimed_grade, description, contact}) {
  return {
    "course_code": validateCourseCode(course_code),
    "aimed_grade": validateGrade(aimed_grade), 
    "description": validateString(description, 1, 1000),
    "contact": validateContactInfo(contact),
  }
}


export function validateContactInfo({method, detail}) {
  const _method = validateInteger(method, 1, 6)
  let _detail = null;
  if (_method == null) return null
  switch (_method) {
    case C_METHOD.SCHOOL_EMAIL:
       _detail = validateSID(detail)?.toString() || null
      break;
    case C_METHOD.PRIVATE_EMAIL:
      const email_checker = /^[\w-\.]{2,80}@([\w-]{2,6}\.)+[\w-]{2,4}$/
      _detail = validateStringWithRegex(email_checker, detail)
      break;
    case C_METHOD.WHATSAPP:
      const phone_checker = /^\+852\s[2-9][0-9]{7}$|^\+86\s[1-8][0-9]{9,10}$|^\+886\s9[0-9]{8}$/
      _detail = validateStringWithRegex(phone_checker, detail)
      break;
    default:
      _detail = validateString(detail, 2, 100)
      break;
  }
  if (_detail == null) return null
  return new ContactInfo(_method, detail)
}

export function validateFacultyID(fid) { return validateInteger(fid, 0, 6) }
export function validatePageID(pid) { return validateInteger(pid, 0, 2) }
export function validateThreadOrder(order) { return validateInteger(order, 1, 2) }
export function validateSID(sid) { return validateInteger(sid, 10000000, 40000000) }
export function validateVerificationCode(vf_code) { return validateInteger(vf_code, 1000, 9999) }
export function validateRreactionType(r_type) { return validateInteger(r_type, 1, 2) }
export function validateReportReason(r_reason) { return validateInteger(r_reason, 0, 7) }
export function validatePositiveInt(num) { return validateInteger(num, 1, Number.MAX_VALUE) }
export function validateNonNegativeInt(num) { return validateInteger(num, 0, Number.MAX_VALUE) }

export function validateThreadTitle(title) { return validateString(title, 1, 50) }
export function validateContent(content) { return validateString(content, 1, 5000) }
export function validateDiscription(discription) {return validateString(discription, 1, 3000)}
export function validateNickname(nickname) { return validateString(nickname, 2, 10) }
export function validateDeviceName(device_name) { return validateString(device_name, 2, 20) }
export function validateThreadQueryText(text) { return validateString(text, 1, 10) }

export function validateGrade(grade) {return validateInteger(grade, 0, 10)}

const courseCode_checker = new RegExp('[A-Za-z]{4}[0-9]{4}')
export function validateCourseCode(code) {
  return validateStringWithRegex(courseCode_checker, code)?.toUpperCase() || null
}

export function validateHashedPassword(pwd) {
  const pwd_checker = /[0-9a-f]{64}/i
  return validateStringWithRegex(pwd_checker, pwd)
}

export function validateCursor(cursor_str) {
  const base64_checker = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
  return validateStringWithRegex(base64_checker, cursor_str)
}

/** @param {RegExp} regex @param {string} str */
export function validateStringWithRegex(regex, str) {
  if (typeof str !== 'string') return null
  if (regex.test(str) == false) return null
  return str
}

/** @param {number} input @param {number} MIN @param {number} MAX */
export function validateInteger(input, MIN, MAX) {
  if (typeof input == 'string') input = parseInt(input)
  if (!Number.isInteger(input)) return null
  if (input < MIN || input > MAX) return null
  return input
}

/** @param {string} input @param {number} MIN @param {number} MAX */
export function validateString(input, MIN_LEN, MAX_LEN) {
  if (typeof input !== 'string') return null
  if ((input = input.trim()) == '') return null
  if (input.length < MIN_LEN || input.length > MAX_LEN) return null
  return input
}

/** @readonly @enum {number} */
export const FACULTY = {
  NONE_OR_ALL: 0,
  ART_AND_HUMAN: 1,
  ECON_AND_BUIS: 2,
  ENIG_AND_TECH: 3,
  ENGLISH: 4,
  MATH_AND_SCIE: 5,
  SOCIAL_SCIENCE: 6
}

/** @readonly @enum {number} */
export const FORUM_PAGE = {
  ALL: 0,
  CASUAL: 1,
  ACADEMIC: 2
}

/** @readonly @enum {number} */
export const THREAD_ORDER = {
  BY_TIME: 1,
  BY_HEAT: 2
}