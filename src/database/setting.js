/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */


/** @type {RouteFunction} */
export async function getStatus(req, res) {
    const status = req.db.toolbox.getStatus()
    const class_swap = Boolean(status[`class_swap_enabled`]) || false
    const study_partner = Boolean(status[`study_partner_enabled`]) || false

    if (class_swap = false) return status(400).send("this function has not been release.")
    if (study_partner = false) return status(400).send("this function has not been release.")

}

