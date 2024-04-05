const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:false,
        unique: false,
    },
    mobile:{
        type:Number
    },
    gender:{
        type:String
    },
    address:{
        type:String
    },
    password:{
        type:String,
        required:true
    },
    userProfile:{
        type:String,
    },
    adminId:{
        type : mongoose.Types.ObjectId
    },
    isDelete:{
        type:Boolean,
        default:false
    }
})

const user = new mongoose.model('user',userSchema);

module.exports = user;