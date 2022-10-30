const Mongoose = require("mongoose")
const UserSchema = new Mongoose.Schema({
    username: {
        type:String,
        unique:true,
        required:true,
    },

    password: {
        type:String,
        minlength: 4,
        required: true,

    },

    role: {
        type :String,
        default: 'Basic',
        required: true,
    },

    subject_id:{
        type:String,
        required:true,
    },

})

const user = Mongoose.model('userInfo', UserSchema)
module.exports = user