express = require('express');
const router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const productController = require('../controllers/C_prodcut');
const auth = require('../middleware/auth');

router.post("/addcategory",multipartMiddleware,productController.addCategory);
router.get("/getcategory",productController.getCategory);
router.post("/editcategory",multipartMiddleware,productController.editCategory);
router.get("/removecategory",productController.removeCategory);

router.post("/addproduct",productController.upload.single("product_picture"),productController.addproduct);
router.get("/getproduct",auth.tokenCheck,productController.getproduct);
router.patch("/editproduct",auth.tokenCheck,productController.upload.single("product_picture"),productController.editproduct);
router.get("/deletedproduct",productController.deletedProducts);
router.get("/revertproduct",productController.retriveProducts);

// order mangement
router.post("/addcart",auth.tokenCheck,multipartMiddleware,productController.addCart);
router.delete("/removecart",auth.tokenCheck,productController.removeCart);
router.get("/numberOfcart",auth.tokenCheck,productController.numberOfCart);
router.get("/getcartitem",auth.tokenCheck,productController.getCartItem);
router.patch("/editcart",multipartMiddleware,productController.editCartItem);

// for order model
router.post("/order",auth.tokenCheck,multipartMiddleware,productController.addorder);
router.post("/payment",auth.tokenCheck,multipartMiddleware,productController.stripePayment);


module.exports = router;