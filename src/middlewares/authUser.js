const userInfo = require('../database/userInfo')
const app = express()
const bcrypt = require("bcryptjs")
app.use(express.json())

exports.register = async (req ,res ,next) => {
    const { username, password }  = req.body
    if(password.length < 8) {
        return res.status(400).json({message: "at least 8 cahracters"})
    }

    try {
        await userInfo.create({
            username,
            password,
        }).then(user =>
            res.status(200).json({
            message : "Account suscessfully created",
            userInfo
            })
        )
    } catch (err) {
        res.status(401).json({
            message: "Account creation failed",
            error: error.message,
        })
    }
}

exports.login = async (req, res, next) => {
    const { username, password } = req.body

    if (!username || !password) {
        return this.register.status(400).json({
            message: "Username or Password not presnet",
        })
    }
}

exports.deleteUser = async (req, res, next) => {
    const { id } = req.body
    await User.findById(id)
      .then(user => user.remove())
      .then(user =>
        res.status(201).json({ message: "User successfully deleted", user })
      )
      .catch(error =>
        res
          .status(400)
          .json({ message: "An error occurred", error: error.message })
      )
  }
  //