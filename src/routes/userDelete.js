const { register, login, update, deleteUser } = require("./middlewares/authUsers");

router.route("/deleteUser").delete(deleteUser);