const Mongoose = require("mongoose")
const UserSchema = new Mongoose.Schema({
    title: {
        type:String,
        minlength:1,
        maxlength:20,
        required:true,
    },

    content: {
        type:String,
        minlength:1,
        maxlength:1000,
        required: true,

    },

    create_time: {
        type:integer,
        required: true,
    },

    valid_time:{
        type:integer,
        required:true,
    },

})

const user = Mongoose.model('userInfo', UserSchema)
module.exports = user