const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId:{
        type: String
    },
    productName:{
        type: String
    },
    categoryName:{
        type: String
    },
    price:{
        type: Number // Changed to Number
    },
    quantity:{
        type: Number // Changed to Number
    },
    product_picture:{
        type: String
    },
    productId:{
        type: mongoose.Schema.ObjectId
    }
});

const cart = mongoose.model('cart', cartSchema);
module.exports = cart;
