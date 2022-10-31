const Mongoose = require("mongoose")
const UserSchema = new Mongoose.Schema({

    enum :{
        吹水臺:0,
        學術臺:1,

    },
    
    tid: {
        type:integer,
        enum:吹水臺,學術臺,
        required:true,
    },

    cid: {
        type:integer,
        minlength: 4,
        required: true,

    },

    fid: {
        type: string,
        required: true,
    },

    create_time: {
        type: integer,
        required: true,
    },

    last_update_time: {
        type: integer,
        required: true,
    },

    title: {
        type:string,
        minlength:1,
        maxlength:20,
        required:true,
    },

    contend_id: {
        type:integer,
        required:true,
    },

    sender: {
        type :Object,
        default: 'Basic',
        required: true,
    },

})

const user = Mongoose.model('userThread', UserSchema)
module.exports = user;