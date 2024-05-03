const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    productName:{
        type:String
    },
    categoryName:{
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    price:{
        type:Number
    },
    quantity:{
        type:Number
    },
    discount:{
        type:Number
    },
    product_picture:{
        type:String
    },
    isDelete:{
        type:Boolean,
        default:false
    }

})

const product = mongoose.model('product', productSchema);
module.exports=product;  //export the model
