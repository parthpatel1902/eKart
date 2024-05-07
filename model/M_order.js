const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    order_personName:{
        type:String
    },
    order_personId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    cartId:{
        type:Array
    },
    AddressId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'address'
    },
    paymentMode:{
        type:String,
        enum:['COD','Online'],
        default:'COD'
    },
    amount:{
        type:Number
    },
    order_status:{
        type:String,
        enum:['Pending','Confirmed','Cancelled','Delivered'],
        default:'Pending'
    },
    order_date:{
        type:Date,
        default:Date.now
    },
    isDelete:{
        type:Boolean,
        default:false
    }
})

const order = mongoose.model('order', orderSchema);
module.exports = order;
