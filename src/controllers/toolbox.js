/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

/** @type {RouteFunction} */
export function getToolboxStatus(req, res) {
   req.db.setting.toolboxAvailabilities()
    .then(availabilities => res.send(availabilities))
    .catch(() => res.status(400).send())
}