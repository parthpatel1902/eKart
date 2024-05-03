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

// order mangement
router.post("/addcart",auth.tokenCheck,multipartMiddleware,productController.addCart);

module.exports = router;