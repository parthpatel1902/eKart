const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    pincode:{
        type:Number
    },
    area:{
        type:String
    },
    state:{
        type:String
    },
    city:{
        type:String
    },
    street:{
        type:String
    },
    building:{
        type:String
    },
    famousplace:{
        type:String
    },
    isDelete:{
        type:Boolean,
        default:false
    }
});

const address = mongoose.model('address', addressSchema);
module.exports = address;
