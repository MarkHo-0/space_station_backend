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
    "title": validateString(title, 20),
    "content": validateString(content, 1000)
  }
}

export function validateFacultyID(fid = 0) {
  if (typeof fid == 'string') fid = parseInt(fid)
  if (!Number.isInteger(fid)) return null
  if (fid < 0 || fid > 6) return null
  return fid
}

export function validatePageID(pid = 0) {
  if (typeof pid == 'string') pid = parseInt(pid)
  if (!Number.isInteger(pid)) return null
  if (pid < 0 || pid > 1) return null
  return pid
}

export function validateString(orgStr = "", maxLength = 0) {
  if (typeof orgStr !== 'string') return null
  if (orgStr.trim() == '') return null
  if (orgStr.length > maxLength) return null
  return orgStr
}

export function validateNickname(nickname = '') {
  if (typeof nickname !== 'string') return null
  if (nickname.length < 2 || nickname.length > 10) return null
  return nickname
}


export function validateSID(sid = 0) {
  if (typeof sid == 'string') sid = parseInt(sid)
  if (!Number.isInteger(sid)) return null
  if (sid < 10000000 || sid > 40000000) return null
  return sid
}

export function validateUID(uid = 0) {
  if (typeof uid == 'string') uid = parseInt(uid)
  if (!Number.isInteger(uid)) return null
  if (uid < 1) return null
  return uid
}

const pwd_checker = /[0-9a-f]{64}/i
export function validateHashedPassword(pwd = '') {
  if (typeof pwd !== 'string') return null
  if (pwd_checker.test(pwd) == false) return null
  return pwd
}

export function validateDeviceName(name = '') {
  if (typeof name !== 'string') return null
  if (name.length > 20) return null
  return name
}

export function validateVerificationCode(vf_code = 0) {
  if (!Number.isInteger(vf_code)) return null
  if (vf_code < 1000 || vf_code > 9999) return null
  return vf_code
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
  CASUAL: 1,
  ACADEMIC: 2
}