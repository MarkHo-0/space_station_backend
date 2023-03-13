import { User, SimpleUser, USER_ACTION } from '../models/user.js'
import { validateRegisterData, validateLoginData, validatePositiveInt, validateNickname } from '../utils/dataValidation.js'
import { generateToken } from '../utils/loginToken.js'
import { OffsetedCursor } from '../utils/pagination.js'
import { timeDiffWithCurr } from '../utils/parseTime.js'

/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

const TOKEN_VALID_DAYS = 182

/** @type {RouteFunction} */
export function getUserData(req, res) {
  const hideSensitive = req.user?.user_id != req.target.user.user_id
  req.db.user.getDetailedOne(req.target.user.user_id)
    .then(user => res.send(user.toJSON(hideSensitive)))
    .catch(_ => res.status(400).send())
}

/** @type {RouteFunction} */
export function getUserThreads(req, res) {
  //解析分頁數據
  const cursor = OffsetedCursor.fromBase64(req.query['cursor'])

  //查詢資料庫並且返回
  req.db.thread.getUserIndexes(req.target.user, 15, cursor)
    .then(ids => req.db.thread.getMany(ids))
    .then(threads => {
      const new_cursor = threads.length < 15 ? '' : cursor.increaseOffset(threads.length).toBase64()
      res.send({'threads': threads, 'continuous': new_cursor})
    }).catch(() => res.status(400).send())
}

/** @type {RouteFunction} */
export async function getUserState(req, res) {
  //檢查學生編號是否合法
  const sid = validatePositiveInt(req.params['sid'])
  if (!sid) return res.status(400).send()

  //檢查用戶是否存在
  const user = await req.db.user.getOneBySID(sid)
  if (user == null) {
    return res.send({sid_state: USER_STATE.NOT_EXIST})
  }

  //檢查用戶是否被禁止登入
  if (await req.db.user.isBannedFrom(user, USER_ACTION.LOGIN)) {
    return res.send({sid_state: USER_STATE.BANNED})
  }

  //用戶正常
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
  const newName = validateNickname(req.body["nickname"])
  if (!newName) return res.status(422).send()

  const oldData = await req.db.user.getNickNameData(req.user)

  //檢查是否和舊的名字一樣
  if (oldData.nickname = newName) return res.status(422).send()

  //如果更改間隔過短 (一星期只能改一次)，則阻止更改
  const updateInterval = 7 * 24 * 60 * 60 
  if (timeDiffWithCurr(oldData.last_update) < updateInterval) {
    res.status(460).send()
  }

  //寫入資料庫
  req.db.user.updateNickname(req.user, newName)
    .then(_ => res.send())
    .catch(_ => res.status(400).send())
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