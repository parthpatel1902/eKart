const express = require('express');
const router = express.Router();


router.get("/",async(req,res)=>{
    res.render("user/index")
})

router.get("/about",async(req,res)=>{
    res.render("user/about")
})

router.get("/viewProduct",async(req,res)=>{
    res.render("user/viewProducts");
})

router.get("/userProfile",async(req,res)=>{
    res.render("user/userProfile")
})

router.get("/forgetPassword",async(req,res)=>{
    res.render("user/forgetPassword")
})

router.get("/test",async(req,res)=>{
    res.render("user/test")
})

module.exports = router