/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

// authUser 為強制身份驗證，tryAuthUser 為自願性身份驗證

/** @type {RouteFunction} */
export function authUser(req, res, next) {
    const token = req.header['Authorization']

    //若無附帶令牌則返回 401 錯誤
    if (!token) res.status(401).send()

    //透過令牌獲取用戶資料，如果資料不存在則返回 401 錯誤
    req.db.user.getByLoginToken(token).then( user => {
        req.user = user
        next()
    }).catch( e => {
        res.status(401).send(e)
    })
}

/** @type {RouteFunction} */
export function tryAuthUser(req, _, next) {
    const token = req.header['Authorization']

    //若無附帶令牌則放棄
    if (!token) return next()

    //無論是否獲取到用戶資料，都繼續前往下一個路由
    req.db.user.getByLoginToken(token)
        .then( user => req.user = user)
        .finally( () => next() )
}