const {errorRes,successRes} = require('../res/msgcode');
const categroy =require('../model/M_category');
const product = require('../model/M_product');
const multer = require('multer');
const cart = require('../model/M_cart');
const fs = require('fs');
const path = require('path');

// for the product category
const addCategory = async(req,res)=>{

    const {categoryName} = req.body;

    const resAvl = await categroy.findOne({categoryName:categoryName});

    if(resAvl){
        return errorRes(res, 400, "Category already exist");
    }

    const insert_data = {
        categoryName:categoryName,
    }

    const res_add = new categroy(insert_data);

    res_add.save()
        .then(async(result) => {
            return res.json({success:true});
        })
        .catch((error) => {
            console.log("Error >>>>> ", error.message);
            return errorRes(res, 500, "Some Internal Error");
    });
}

const getCategory = async(req,res)=>{

    const res_data = await categroy.find({isDelete:false},{__v:0,isDelete:0});
    if(res_data.length > 0){
        return successRes(res, 200, "Category List", res_data);
    }else{
        return errorRes(res, 400, "No Category Found");
    }
}

const editCategory = async(req,res)=>{
    try {
        const {categoryName,id} = req.body;

        const resAvl = await categroy.findOne({categoryName:categoryName});

        if(resAvl && resAvl._id != id){
            return errorRes(res, 400, "Category already exist");
        }

        const res_edit = await categroy.findByIdAndUpdate({ _id: id },{categoryName:categoryName}, { new: true });

        if(res_edit){
            return res.json({success:true});
        }else{
            return errorRes(res, 500, "Some Internal Error");
        }

    } catch (error) {
        console.log("Error to edit category function",error);
        return errorRes(res, 500, "Some Internal Error");
    }


}

const removeCategory = async(req,res)=>{
    const id = req.query.id;

    const resRemoveCategory = await categroy.findByIdAndUpdate({_id:id},{isDelete:true},{ new: true });

    if(removeCategory){
        res.json({success:true});
    }
}

// for the product

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/') // Directory where files will be stored
    },
    filename: function (req, file, cb) {
      cb(null, `${req.body.productName}-${file.originalname}`) // Use original file name
    }
});

const upload = multer({ storage: storage });

const addproduct = async(req,res)=>{
    try {
        const {productName,categoryName,price,quantity,discount} = req.body;

        const insert_data = {
            productName:productName,
            categoryName:categoryName,
            price:price,
            quantity:quantity,
            discount:discount,
            product_picture:req.file.filename
        }

        const res_add = new product(insert_data);

        res_add.save()
            .then(async(result) => {
                return res.json({success:true});
            })
            .catch((error) => {
                console.log("Error >>>>> ", error.message);
                return errorRes(res, 500, "Some Internal Error");
        });
    } catch (error) {
        console.log("Error to add product :",error);
    }
}

const getproduct = async(req,res)=>{
    try {
        const resgetProduct = await product.find({isDelete:false},{__v:0,isDelete:0,createdAt:0});
        return successRes(res,200,"Product List : ",resgetProduct);
    } catch (error) {
        console.log("Error to find data from the getproduct");
    }
}

const editproduct = async(req,res)=>{
    try {
        const {productId} = req.body;

        if(req.body.isDelete){
            const productData = await product.findByIdAndUpdate({_id:productId},{isDelete:true},{new:true});
            await cart.deleteMany({productId:productId});
            return res.json({success:true});
        }

        let discount = req.body.discount || (await product.findOne({_id:productId},{_id:0,discount:1})).discount;

        let query = {};

        if(req.body.productName){
            query.productName = req.body.productName;
        }
        if(req.body.categoryName){
            query.categoryName = req.body.categoryName;
        }
        if(req.body.price){
            query.price = req.body.price - (req.body.price * discount)/100;
        }

        if(req.file){
            const photoName = await product.findOne({_id:productId},{_id:0,product_picture:1})
            const PathDelete = path.join(__dirname,`../src/${photoName.product_picture}`);
            fs.unlinkSync(PathDelete);

            const updateStudents = await product.findByIdAndUpdate({ _id: productId }, {...req.body,product_picture:req.file.filename}, { new: true });
            
            await cart.updateMany({ productId: productId }, query); 
            
            return res.json({success:true,data:updateStudents});
        }else{
            const res_edit = await product.findOneAndUpdate({_id:productId},{$set:req.body},{new:true});

            const res_edit_cart =  await cart.updateMany({ productId: productId }, query); 

            return res.json({success:true,data:res_edit});
        }

    } catch (error) {
        console.log("Error :",error);
        return errorRes(res,500,"Some Internal Errror")
    }
}

const deletedProducts = async(req,res)=>{
    try {
        const products = await product.find({isDelete:true},{__v:0});
        return res.json({success:true,data:products});
    } catch (error) {
        console.log("Error from the deletedProducts : ",error);
    }
}

const retriveProducts = async(req,res)=>{
    try {
        const {pid} = req.query;

        const resRevert = await product.findByIdAndUpdate({_id:pid},{isDelete:false},{new:true});
    
        return res.json({success:true,data:resRevert});
    } catch (error) {
        console.log("Error from the deletedProducts : ",error);
    }
}

// for the cart

const addCart = async(req,res)=>{
    try {
        const {productName,categoryName,price,quantity,subtotal,product_picture,productId} = req.body;

        const insert_data = {
            userId:req.user.id,
            productName:productName,
            categoryName:categoryName,
            price:price,
            quantity:quantity,
            product_picture:product_picture,
            productId:productId
        }

        const res_add = new cart(insert_data);

        res_add.save()
        .then(async(result) => {

            const totalcart = await cart.find({userId:req.user.id}).count();

            return res.json({success:true,cartId:res_add._id,numberCart:totalcart});
        })
        .catch((error) => {
            console.log("Error >>>>> ", error.message);
            return errorRes(res, 500, "Some Internal Error");
        });
    } catch (error) {
        console.log("Error from the addcart function : ",error);
        return errorRes(res,500,"some internal error");
    }


}

const removeCart = async(req,res)=>{
    const cartId = req.query.cartId;
    try {
        const removecartRes = await cart.findByIdAndDelete({_id:cartId})

        if(removeCart){
            const totalcart = await cart.find({userId:req.user.id}).count();
            return res.json({success:true,numberCart:totalcart});
        }

    } catch (error) {
        console.log("error from the removeCart function : ",error);
    }
}

const numberOfCart = async(req,res)=>{
    const userId = req.user.id;
    try {
        const totalcart = await cart.find({userId:userId}).count();

        if(totalcart){
            return res.json({success:true,numberCart:totalcart})
        }

    } catch (error) {
        console.log("error from the numberOfeCart function : ",error);
    }
}

const getCartItem = async(req,res)=>{
    const userId = req.user.id;
    try {
        const totalcart = await cart.find({userId:userId});

        const cartItems = [];

        totalcart.map((item)=>{
            let insert_data = {
                _id:item._id,
                productName:item.productName,
                categoryName:item.categoryName,
                price:item.price,
                quantity:item.quantity,
                subtotal:Number(item.price * item.quantity),
                product_picture:item.product_picture,
                productId:item.productId
            }

            cartItems.push(insert_data);
        })

        if(totalcart){
            return res.json({success:true,data:cartItems});
        }

    } catch (error) {
        console.log("error from the getCart function : ",error);
    }
}

const editCartItem = async(req,res)=>{
    try {
        const {id,quantity,subtotal} = req.body;
        const cartItem = await cart.findByIdAndUpdate({_id:id},{...req.body},{new:true});
        if(cartItem){
            return res.json({success:true,data:{quantity:cartItem.quantity,subtotal:cartItem.subtotal}});
        }
    } catch (error) {
        console.log("Error from the editCartItem >>> ",error);
        return errorRes(res,500,"Some Internal Error");
    }
}

// end of the cart model

module.exports = {
    addCategory,
    getCategory,
    editCategory,
    removeCategory,
    addproduct,upload,
    getproduct,
    editproduct,
    addCart,
    removeCart,
    numberOfCart,
    getCartItem,
    editCartItem,
    deletedProducts,
    retriveProducts
}