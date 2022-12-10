import { User, SimpleUser } from '../models/user.js'
import { validateRegisterData } from '../utils/dataValidation.js'

/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

/** @type {RouteFunction} */
export function getUserData(req, res) {

}

/** @type {RouteFunction} */
export function getUserThreads(req, res) {

}

/** @type {RouteFunction} */
export function getUserState(req, res) {

}

/** @type {RouteFunction} */
export async function userRegister(req, res) {
  //校驗資料是否正確
  const { sid, nickname, pwd } = validateRegisterData(req.body)
  if (!sid || !nickname || !pwd) {
    return res.status(422).send('Invalid Inputs.')
  }

  //檢查用戶是否曾經已註冊
  if (Number.isInteger(await req.db.user.toUserID(sid))) {
    return res.status(400).send('User already registered.')
  }

  //檢查用戶是否已通過郵件驗證
  const verificationData = await req.db.user.getVerificationData(sid)
  if (!verificationData || !verificationData.used) {
    return res.status(400).send('User has not been verified.')
  }

  //創建用戶並加入資料庫
  req.db.user.createOne(sid, nickname, pwd)
    .then(_ => res.send('Registration successful'))
    .catch(_ => res.status(400).send('Register falied due to unknown reason.'))
}

/** @type {RouteFunction} */
export function userLogin(req, res) {

}

/** @type {RouteFunction} */
export function userLogout(req, res) {

}

/** @type {RouteFunction} */
export function updateUserFaculty(req, res) {

}

/** @type {RouteFunction} */
export function updateUserNickname(req, res) {

}