/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

// authUser 為強制身份驗證，tryAuthUser 為自願性身份驗證

/** @type {RouteFunction} */
export async function authUser(req, res, next) {
    const token = req.header['Authorization']

    //若無附帶令牌則返回 401 錯誤
    if (!token) {
      return res.status(401).send()
    }

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
    
    //透過用戶編號獲取用戶資料
    req.db.user.getOne(token_info.user_id).then(user => {
      //將資料掛載在 req 對象上，讓後方路由可獲取使用
      req.user = user
      next()
    }).catch( res.status(401).send() )
}

/** @type {RouteFunction} */
export async function tryAuthUser(req, _, next) {
    const token = req.header['Authorization']

    //若無附帶令牌則直接略過身份驗證
    if (!token) return next()

    //解密令牌
    const token_info = await req.db.user.decryptToken(token)

    //若令牌錯誤或過期也略過驗證
    if (!token_info || token_info.expired) return next()

    //無論是否獲取到用戶資料，都繼續前往下一個路由
    req.db.user.getOne(token_info.user_id)
        .then( user => req.user = user)
        .catch(null)
        .finally( () => next() )
}
