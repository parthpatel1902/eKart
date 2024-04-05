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

module.exports = router