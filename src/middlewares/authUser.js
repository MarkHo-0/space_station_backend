import { RouteFunction } from '../types/express.js'

/** @type {RouteFunction} */
export function authUser(req, res, next) {
    const token = req.header['Authorization']

    //若無附帶令牌則返回 401 錯誤
    if (!token) res.status(401).send()

    //透過令牌獲取用戶資料，如果資料不存在則返回 401 錯誤
    req.db.user.getByToken(token).then( user => {
        req.user = user
        next()
    }).catch( e => {
        res.status(401).send(e)
    })
}