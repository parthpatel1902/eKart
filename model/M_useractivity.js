const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({

    name:{
        type:String
    },
    email:{
        type:String
    },
    date:{
        type:Date
    },
    logintime:{
        type:String
    },
    logouttime:{
        type:String
    },
    adminId:{
        type:  mongoose.Types.ObjectId
    }
})

const userActivity = new mongoose.model('userActivity',userSchema);

module.exports = userActivity;