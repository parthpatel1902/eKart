const express = require('express');
const router = express.Router();


router.get("/",async(req,res)=>{
    res.render("user/index")
})

router.get("/about",async(req,res)=>{
    res.render("user/about")
})

router.get("/todo",async(req,res)=>{
    res.render("user/todo")
})

router.get("/userProfile",async(req,res)=>{
    res.render("user/userProfile")
})

router.get("/forgetPassword",async(req,res)=>{
    res.render("user/forgetPassword")
})

module.exports = router