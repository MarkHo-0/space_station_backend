export function validateRegisterData({sid, nickname, pwd}) {
  return {
    "sid": validateSID(sid),
    "nickname": validateNickname(nickname),
    "pwd": validateHashedPassword(pwd)
  }
}

export function validateNickname(nickname = '') {
  if (typeof nickname !== 'string') return null
  if (nickname.length < 2 || nickname.length > 10) return null
  return nickname
}

export function validateSID(sid = 0) {
  if (!Number.isInteger(sid)) return null
  if (sid < 10000000 || sid > 40000000) return null
  return sid
}

export function validateUID(uid = 0) {
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