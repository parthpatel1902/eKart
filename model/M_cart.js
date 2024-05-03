const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId:{
        type:String
    },
    productName:{
        type:String
    },
    categoryName:{
        type:String
    },
    price:{
        type:String
    },
    quantity:{
        type:String
    },
    subtotal:{
        type:String
    },
    product_picture:{
        type:String
    }
})

const cart = mongoose.model('cart', cartSchema);
module.exports=cart;
