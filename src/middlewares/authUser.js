import { application, Router } from "express";
const router = Router()

//TODO: Find out a way to validate user.
function validateUser(token) {
    return true
}


router.use((req, res, next) => {
    const token = req.header['Authorization']
    if (validateUser(token)) {
        next()
    } else {
        res.status(401).send()
    }
  })