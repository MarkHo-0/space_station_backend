const userInfo = require('../database/user')
const app = express()
const bcrypt = require("bcryptjs")
app.use(express.json())

exports.register = async (req ,res ,next) => {
    const { uid, nickname, subject_id }  = req.body
    if(password.length < 8) {
        return res.status(400).json({message: "at least 8 cahracters"})
    }

    try {
        await userInfo.create({
            uid,
            nickname,
            subject_id,
        }).then(user =>
            res.status(200).json({
            message : "Account suscessfully created",
            userInfo
            })
        )
    } catch (err) {
        res.status(422).json({
            message: "Account creation failed",
            error: error.message,
        })
    }
}

exports.login = async (req, res, next) => {
    const { uid, nickname, subject_id } = req.body

    if (!uid || !nickname || !subject_id) {
        return this.register.status(422).json({
            message: "input error occured",
        })
    }
}
  //