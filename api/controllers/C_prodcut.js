const {errorRes,successRes} = require('../res/msgcode');
const categroy =require('../model/M_category');
const product = require('../model/M_product');
const multer = require('multer');
const cart = require('../model/M_cart');
const fs = require('fs');
const path = require('path');
const order = require('../model/M_order');
const user = require('../model/M_user');
const address = require('../model/M_address');
const puppeteer = require('puppeteer');

const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
const stripe = require('stripe')(STRIPE_SECRET_KEY)

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
        
        const oldName = await categroy.findOne({_id:id},{categoryName:1,_id:0});

        const res_edit = await categroy.findByIdAndUpdate({ _id: id },{categoryName:categoryName}, { new: true });
    
        if(res_edit){
    
            await product.updateMany({categoryName: oldName.categoryName},{$set:{categoryName:categoryName}});
    
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

    const oldName = await categroy.findOne({_id:id},{categoryName:1,_id:0});

    const resRemoveCategory = await categroy.findByIdAndUpdate({_id:id},{isDelete:true},{ new: true });
    
    if(removeCategory){
        
        await product.updateMany({categoryName: oldName.categoryName},{$set:{isDelete:true}});

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
        const resgetProduct = await product.find({isDelete:false},{__v:0,isDelete:0});
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

            const totalcart = await cart.find({userId:req.user.id,isPurchased:false}).count();

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
            const totalcart = await cart.find({userId:req.user.id,isPurchased:false}).count();
            return res.json({success:true,numberCart:totalcart});
        }

    } catch (error) {
        console.log("error from the removeCart function : ",error);
    }
}

const numberOfCart = async(req,res)=>{
    const userId = req.user.id;
    try {
        const totalcart = await cart.find({userId:userId,isPurchased:false}).count();

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
        
        const totalcart = await cart.find({userId:userId,isPurchased:false})
        .populate({
            path: "productId",
            select: "quantity"
        }).exec();

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

// for the order model

const addorder = async(req,res)=>{
    try {

        const order_personName = await user.findOne({_id:req.user.id},{_id:0,name:1});

        const AddressId = await address.findOne({userId:req.user.id},{_id:1});

        const cartRes = await cart.aggregate([
            {
              $match: {
                userId: req.user.id,
                isPurchased:false
              }
            },
            {
              $project: {
                _id: 1,
                subtotal: { $multiply: ["$price", "$quantity"] },
                productId:1,
                quantity:1
              }
            }
        ])

        let amount = 0;
        
        const cartId = [];

        const minusQty = [];

        cartRes.map((item)=>{
            amount = amount + item.subtotal;
            cartId.push(item._id);
            minusQty.push({productId:item.productId,quantity:item.quantity});
        })

        const insert_data = {
            order_personId:req.user.id,
            order_personName:order_personName.name,
            cartId:cartId,
            AddressId:AddressId._id,
            paymentMode: req.body.paymentMode || "COD",
            amount:amount,
            createdAt:new Date(),
        }

        const res_add = new order(insert_data);

        res_add.save()
        .then(async(result) => {

            await cart.updateMany({_id:{$in:cartId}},{$set:{isPurchased:true}});
            
            await Promise.all(minusQty.map(async (item) => {
                await product.updateOne({_id: item.productId}, { $inc: { quantity: -item.quantity } });
            }));

            mangeCart();

            return res.json({success:true,data:res_add});
        })
        .catch((error) => {
            console.log("Error >>>>> ", error.message);
            return errorRes(res, 500, "Some Internal Error");
        });

    } catch (error) {
        console.log("Error from the order table : ",error);
        return errorRes(res,500,"some internal error");
    }
}

const mangeCart = async()=>{
    try {
        const findQuantityZeroProduct = await product.find({quantity:0},{_id:1})
        const resDelete = await cart.deleteMany({productId:{$in:findQuantityZeroProduct},isPurchased:false});
    } catch (error) {
        console.log("Error from the mangeCart function >>>",error);
    }
}

const stripePayment = async(req, res) => {
    try {
        const userId = req.user.id;
        const {pid} = req.body;

        const order_personName = await user.findOne({_id: req.user.id}, {_id: 0, name: 1});
        const AddressId = await address.findOne({userId: req.user.id}, {_id: 1});

        const cartRes = await cart.aggregate([
            {
                $match: {
                    userId: req.user.id,
                    isPurchased: false
                }
            },
            {
                $project: {
                    _id: 1,
                    subtotal: { $multiply: ["$price", "$quantity"] },
                    productId: 1,
                    quantity: 1
                }
            }
        ]);

        let amount = 0;
        const cartId = [];
        const minusQty = [];

        cartRes.map((item) => {
            amount = amount + item.subtotal;
            cartId.push(item._id);
            minusQty.push({productId: item.productId, quantity: item.quantity});
        });

        const userAddress = await address.findOne({userId: userId});
        const userDetails = await user.findOne({_id: userId});

        stripe.customers.create({
            email: userDetails.email,
            source: pid,
            name: userDetails.name,
            address: {
                line1: userAddress.street + "," + userAddress.area + ",",
                city: userAddress.city,
                state: userAddress.state,
                postal_code: userAddress.pincode,
                country: 'India',
            }
        })
        .then((customer) => {
            const totalAmount = Math.round(amount * 100); // Ensuring the amount is an integer
            return stripe.charges.create({
                amount: totalAmount,
                description: "E-commerce site",
                currency: 'INR',
                customer: customer.id
            });
        })
        .then((charge) => {
            console.log(charge);
            const insert_data = {
                order_personId: req.user.id,
                order_personName: order_personName.name,
                cartId: cartId,
                AddressId: AddressId._id,
                paymentMode: "Online",
                amount: amount,
                receipt_url: charge.receipt_url,
                createdAt: new Date(),
            };

            const res_add = new order(insert_data);

            res_add.save()
            .then(async(result) => {
                await cart.updateMany({_id: {$in: cartId}}, {$set: {isPurchased: true}});

                minusQty.map(async(item) => {
                    await product.updateOne({_id: item.productId}, { $inc: { quantity: -item.quantity } });
                });

                return res.json({success: true, data: res_add});
            })
            .catch((error) => {
                console.log("Error >>>>> ", error.message);
                return errorRes(res, 500, "Some Internal Error");
            });

        })
        .catch((err) => {
            console.log(err);
            return errorRes(res, 500, "Payment failed");
        });

    } catch (error) {
        console.log("Error from the stripePayment function >>>>>", error);
        return errorRes(res, 500, "Some internal error");
    }
};

const getOrderInvoice = async(req,res)=>{
    try {
        
        const orderId = req.query.id;

        const invoiceData = {
            companyLogo: 'http://localhost:9999/cart.png',
        };

        const orderData = await order.findOne({_id:orderId});

        const orderdate = new Date(orderData.order_date);
        const formattedDate = `${orderdate.getDate().toString().padStart(2, '0')}-${(orderdate.getMonth() + 1).toString().padStart(2, '0')}-${orderdate.getFullYear()}`;
        const formattedTime = orderdate.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });         
        invoiceData.invoiceDate = `${formattedDate} ${formattedTime}`;
        
        invoiceData.customerName = orderData.order_personName;

        const mobile = await user.findOne({_id:orderData.order_personId},{_id:0,mobile:1})
        invoiceData.mobile = mobile.mobile;

        const deliveryAddress = await address.findOne({userId:orderData.order_personId});
        invoiceData.deliveryAddress = `${deliveryAddress.building}, ${deliveryAddress.street}, ${deliveryAddress.area}, ${deliveryAddress.city}, ${deliveryAddress.state}, ${deliveryAddress.pincode}, Famous-${deliveryAddress.famousplace}`

        const cartItems = await Promise.all(orderData.cartId.map(async (id) => {
            const cartItem = await cart.findOne({_id: id}, {_id: 0, product_picture: 1, productName: 1, quantity: 1, price: 1});
            return {name: cartItem.productName, image: `http://localhost:9999/${cartItem.product_picture}`, price: cartItem.price, quantity: cartItem.quantity};
        }));

        invoiceData.products = cartItems;
        invoiceData.totalPrice = orderData.amount;
        invoiceData.paymentMethod = orderData.paymentMode;
        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set content for PDF
        const content = `
            <html>
            <head>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                <style>
                /* Custom styles */
                body {
                    font-family: Arial, sans-serif;
                }
                .invoice-header {
                    margin-bottom: 20px;
                }
                .invoice-details p {
                    margin-bottom: 5px;
                }
                .invoice-table th, .invoice-table td {
                    vertical-align: middle;
                }
                .invoice-footer {
                    margin-top: 20px;
                }
                </style>
            </head>
            <body>
                <div class="container">
                <div class="row justify-content-between invoice-header mt-5 border p-2 text-primary shadow-sm" style="border-radius: 10px;">
                    <div class="col-auto">
                    <img src="${invoiceData.companyLogo}" alt="Company Logo" style="max-height: 50px;">
                    </div>
                    <div class="col-auto">
                    <h1 class='ml-5'>The eKart Ltd</h1>
                    </div>
                </div>
                <div class="invoice-details2" style="margin-right: 400px">
                    <table class="table table-bordered shadow-sm">

                        <tr><td><strong>Order Date:- </strong> <u> ${invoiceData.invoiceDate}</u></td></tr>
                        <tr><td><strong>Customer Name:</strong>${invoiceData.customerName}</td></tr>
                        <tr><td><strong>Mobile:</strong> ${invoiceData.mobile}</td></tr>
                        <tr><td><strong>Delivery Address:</strong><span class='text-primary'> ${invoiceData.deliveryAddress}</span></td></tr>
                    </table>
                    </div>
                <div class="invoice-body mt-4">
                    <table class="table table-bordered shadow-sm">
                    <thead>
                        <tr>
                        <th>No.</th>
                        <th>Product Name</th>
                        <th>Product Image</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoiceData.products.map((product, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${product.name}</td>
                            <td><img src="${product.image}" alt="${product.name}" style="max-height: 50px;"></td>
                            <td> ₹${product.price}</td>
                            <td>${product.quantity}</td>
                            <td>${product.price * product.quantity}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                    </table>
                </div>
                <div class="row justify-content-end invoice-footer">
                    <div class="col-auto">
                    <p class='border text-center rounded-2'><strong>Total Price:</strong>  ₹${invoiceData.totalPrice}</p>
                    <p><strong>Payment Method:</strong> ${invoiceData.paymentMethod}</p>
                    </div>
                </div>
                </div>
            </body>
            </html>
        `;

        await page.setContent(content);
        await page.pdf({ path: `invoices/${orderId}-invoice.pdf`, format: 'A4' });
        await browser.close();

        const filePath = path.join(__dirname, `../invoices/${orderId}-invoice.pdf`);

        res.download(filePath);

    } catch (error) {
        console.log("Error from the getOrderInvoice >>> ",error);
        return errorRes(res,500,"Some internal error");
    }
}

const getTransactionReceipt = async(req,res)=>{
    try {
        const orderId = req.query.id; 
        const recUrl = await order.findOne({_id:orderId},{_id:0,receipt_url:1})
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(recUrl.receipt_url, {
            waitUntil: 'networkidle2',
        });

        await page.pdf({
            path: `receipts/${orderId}-transactionreceipt.pdf`,
            format: 'A4',
            printBackground: true,
        });

        const filePath = path.join(__dirname, `../receipts/${orderId}-transactionreceipt.pdf`);

        res.download(filePath);

    } catch (error) {
        console.log("Error from the getOrderInvoice >>> ",error);
        return errorRes(res,500,"Some internal error");
    }
}

const totalSelling = async(req,res)=>{
    try {
        const total =  await order.aggregate([
            {
              $match: {
                isDelete: false,
              }
            },
            {
              $group: {
                _id: null,
                totalSellingAmount: { $sum: "$amount" }
              }
            },
            {
              $project: {
                _id: 0,
                totalSellingAmount: 1
              }
            }
          ]);

        return res.json({success:true,data:total});
          
    } catch (error) {
        console.log("Error from the totalSelling >>",error);
        return errorRes(res,500,"Some Internal Error");
    }
}

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
    retriveProducts,
    addorder,
    stripePayment,
    getOrderInvoice,
    getTransactionReceipt,
    totalSelling
}

