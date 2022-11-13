exports.login = async (req, res, next) => {

    try {
      const user = await userInfo.findOne({ sid, pwd, device_name })
      if (!user) {
        res.status(404).json({
          message: "Login not successful",
          error: "User not found",
        })
      } else {
        res.status(200).json({
          message: "Login successful",
          user,
        })
      }
    } catch (error) {
      res.status(401).json({
        message: "An error occurred",
        error: error.message,
      })
    }
  }
  //