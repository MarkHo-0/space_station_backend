export function getDB(connection) {
    return function(req, _, next) {
        req.db = connection
        next()
    }
}