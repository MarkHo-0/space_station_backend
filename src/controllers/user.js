import { User, SimpleUser } from '../models/user.js'
import { validateRegisterData, validLoginData } from '../utils/dataValidation.js'
import { generateToken } from '../utils/loginToken.js'

/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

const TOKEN_VALID_DAYS = 182

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
  if (Number.isInteger(await req.db.user.getOneBySID(sid))) {
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
export async function userLogin(req, res) {
  //校驗資料是否正確
  const { sid, pwd, device_name } = validLoginData(req.body)
  if (!sid || !pwd) return res.status(401).send()

  //驗證學生編號和密碼是否正確
  if(await req.db.user.isSidAndPwdMatched(sid, pwd) == false){
    return res.status(401).send()
  }

  //獲取用戶資料以及生成令牌
  const user = await req.db.user.getOneBySID(sid)
  const token = generateToken(sid)

  //將令牌資料寫入資料庫，成功後返回用戶相關訊息
  req.db.user.createLoginState(user.user_id, token, TOKEN_VALID_DAYS, device_name).then(_ => 
    res.send({
      "token": token,
      "valid_time": TOKEN_VALID_DAYS,
      "user": user.toJSON()
    })
  ).catch(_ => res.status(400).send())
}

/** @type {RouteFunction} */
export function userLogout(req, res) {
  req.db.user.removeLoginState(req.headers.authorization)
    .then(_ => res.send())
    .catch(_ => res.status(400).send())
}

/** @type {RouteFunction} */
export function updateUserFaculty(req, res) {

}

/** @type {RouteFunction} */
export function updateUserNickname(req, res) {

}