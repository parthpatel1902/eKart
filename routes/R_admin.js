const express = require('express');
const router = express.Router();
const adminController = require("../controllers/C_admin")
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart()
const auth = require('../middleware/auth');

router.post('/addadmin',adminController.upload.single('profile_photo'), adminController.addadmin);
router.post('/adminlogin',multipartMiddleware,adminController.adminlogin);
router.get('/logout', multipartMiddleware,adminController.adminlogout);
router.get('/checkavlemail',adminController.checkavlemail);
router.get("/sendMail",adminController.sendEmail);
router.post("/updatePassword",multipartMiddleware,adminController.updatePassword);
router.post("/changePassword",auth.tokenCheck,multipartMiddleware,adminController.changePassword);


router.post("/notification",multipartMiddleware,adminController.sentNotification);

// token api
router.post("/getdetils",multipartMiddleware,auth.tokenCheck,adminController.getdetails);

// check email and mobile available not
router.get('/checkavl',adminController.checkAvl);


// add user
router.post("/adduser",auth.tokenCheck,adminController.upload.single('userProfile'),adminController.addUser);
// display user details
router.get("/displayusers",auth.tokenCheck,adminController.getUserDetails);
// soft delete user
router.get("/deleteuser",adminController.deleteUser);
// update the user details
router.post("/updateuser/:id",adminController.upload.single('userProfile'),adminController.updateUser);


router.get("/allOrder",auth.tokenCheck,adminController.getAllOrders);
router.post("/order",auth.tokenCheck,multipartMiddleware,adminController.editAllOrdersStatus);

module.exports = router
