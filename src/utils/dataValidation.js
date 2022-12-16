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

export function validateThreadQueryData({pid, fid, order, cursor}) {
  return {
    "pid": validatePageID(pid),
    "fid": validateFacultyID(fid),
    "order": validateThreadOrder(order) || THREAD_ORDER.BY_TIME,
    "cursor": validateCursor(cursor)
  }
}

export function validateCommentData({tid, reply_to, content}){
  return {
    "tid": validatePositiveInt(tid),
    "reply_to": validatePositiveInt(reply_to),
    "content": validateContent(content)
  }
}

export function validateFacultyID(fid) { return validateInteger(fid, 0, 6) }
export function validatePageID(pid) { return validateInteger(pid, 1, 2) }
export function validateThreadOrder(order) { return validateInteger(order, 1, 2) }
export function validateSID(sid) { return validateInteger(sid, 10000000, 40000000) }
export function validateVerificationCode(vf_code) { return validateInteger(vf_code, 1000, 9999) }
export function validatePositiveInt(tid) { return validateInteger(tid, 1, Number.MAX_VALUE) }

export function validateThreadTitle(title) { return validateString(title, 1, 20) }
export function validateContent(content) { return validateString(content, 1, 5000) }
export function validateNickname(nickname) { return validateString(nickname, 2, 10) }
export function validateDeviceName(device_name) { return validateString(device_name, 2, 20) }

const pwd_checker = /[0-9a-f]{64}/i
/** @param {string} pwd */
export function validateHashedPassword(pwd) {
  if (typeof pwd !== 'string') return null
  if (pwd_checker.test(pwd) == false) return null
  return pwd
}

const base64_checker = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
/** @param {string} cursor_str */
export function validateCursor(cursor_str) {
  if (typeof cursor_str !== 'string') return null
  if (base64_checker.test(cursor_str) == false) return null
  try {
    const cursor = window.atob(cursor_str)
    return JSON.parse(cursor)
  } catch (error) { return null }
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