const {errorRes,successRes} = require('../res/msgcode');
const categroy =require('../model/M_category');
const product = require('../model/M_product');
const multer = require('multer');
const cart = require('../model/M_cart');

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

        if(resAvl){
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
        const resgetProduct = await product.find({},{__v:0,isDelete:0,createdAt:0});
        return successRes(res,200,"Product List : ",resgetProduct);
    } catch (error) {
        console.log("Error to find data from the getproduct");
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
            subtotal:subtotal,
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

        if(totalcart){
            return res.json({success:true,data:totalcart});
        }

    } catch (error) {
        console.log("error from the getCart function : ",error);
    }
}

module.exports = {
    addCategory,
    getCategory,
    editCategory,
    removeCategory,
    addproduct,upload,
    getproduct,
    addCart,
    removeCart,
    numberOfCart,
    getCartItem
}