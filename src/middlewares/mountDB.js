export function mountDB(database) {
    return function(req, _, next) {
        req.db = database
        next()
    }
}