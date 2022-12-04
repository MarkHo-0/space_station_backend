export function mountDB(getDatabaseInstanceFunction) {
    return function(req, _, next) {
        req.db = getDatabaseInstanceFunction()
        next()
    }
}