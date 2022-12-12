/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

// authUser 為強制身份驗證，tryAuthUser 為自願性身份驗證

/** @type {RouteFunction} */
export async function authUser(req, res, next) {
  //若無附帶令牌則返回 401 錯誤
  const token = req.headers.authorization
  if (!token) return res.status(401).send()

  //解密令牌
  const token_info = await req.db.user.decryptToken(token)
  //如無法獲取則表示令牌無效
  if (!token_info) {
    return res.status(401).send()
  }

  //如令牌過期則刪除並且返回錯誤
  if (token_info.expired) {
    req.db.user.removeLoginToken(token)
    return res.status(401).send()
  }

  //獲取用戶資料
  const user = await req.db.user.getOneByUID(token_info.user_id)
  if (!user) return res.status(401).send()
  
  //掛載用戶資料在 req 對象上
  req.user = user
  next()
}

/** @type {RouteFunction} */
export async function tryAuthUser(req, _, next) {
  //若無附帶令牌則直接略過身份驗證
  const token = req.headers.authorization
  if (!token) return next()

  //解密令牌
  const token_info = await req.db.user.decryptToken(token)

  //若令牌錯誤或過期也略過驗證
  if (!token_info || token_info.expired) return next()

  //嘗試獲取用戶資料並掛載在 req 對象上
  const user = await req.db.user.getOneByUID(token_info.user_id)
  if (user) req.user = user
  next()
}
