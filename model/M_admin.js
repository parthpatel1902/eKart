const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    profile_photo:{
        type:String
    }
})

const admin = mongoose.model('admin', adminSchema);
module.exports=admin;  //export the model
