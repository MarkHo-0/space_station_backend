import { User, SimpleUser } from '../models/user.js'
import { validateRegisterData, validateLoginData, validatePositiveInt } from '../utils/dataValidation.js'
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
export async function getUserState(req, res) {
  //檢查學生編號是否合法
  const sid = validatePositiveInt(req.params['sid'])
  if (!sid) return res.status(400).send()

  //透過學生編號獲取用戶訊息
  const user = await req.db.user.getOneBySID(sid)

  //若果無法找到用戶則搜尋驗證列表
  //如果找到則刪除該驗證訊息，需要用戶重新驗證
  if (!user) {
    const vfData = await req.db.user.getVerificationData(sid)
    if (vfData) await req.db.user.removeVerificationData(sid)
    return res.send({sid_state: USER_STATE.NOT_EXIST})
  }

  //TODO: 等待完成用戶權限功能後，再添加禁止登入檢查

  res.send({sid_state: USER_STATE.NORMAL})
}

/** @type {RouteFunction} */
export async function userRegister(req, res) {
  //校驗資料是否正確
  const { sid, nickname, pwd } = validateRegisterData(req.body)
  if (!sid || !nickname || !pwd) {
    return res.status(422).send('Invalid Inputs.')
  }

  //檢查用戶是否曾經已註冊
  if (await req.db.user.getOneBySID(sid)) {
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
  const { sid, pwd, device_name } = validateLoginData(req.body)
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
export async function updateUserNickname(req, res) {
  const { nickname } = validateRegisterData(req.body)
  if ( !nickname ) {
    return res.status(422).send('Invalid Inputs.')
  }

  if (await req.db.user.getUserData(sid)) {
    return res.status(400).send('nickname already exist.')
  }
  req.db.user.updateNickname(user)
    .then(_ => res.send('nickname changed successful'))
    .catch(_ => res.status(400).send('nickname change falied due to unknown reason. Please try again.'))
}

/** @type {RouteFunction} */
export async function updateUserFaculty(req, res) {
  const { Faculty } = validateRegisterData(req.body)
  if ( !Faculty ) {
    return res.status(422).send('Invalid Inputs.')
  }
  
  req.db.user.updateFaculty(user)
    .then(_ => res.send('Faculty changed successful'))
    .catch(_ => res.status(400).send('Faculty change falied due to unknown reason. Please try again.'))
}





/** @readonly @enum {number} */
const USER_STATE = {
  NOT_EXIST: 0,
  NORMAL: 1,
  BANNED: 2,
}