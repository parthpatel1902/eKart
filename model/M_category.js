const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    categoryName:{
        type:String
    },
    isDelete:{
        type:Boolean,
        default:false
    }

})

const category = mongoose.model('category', categorySchema);
module.exports=category;  //export the model
