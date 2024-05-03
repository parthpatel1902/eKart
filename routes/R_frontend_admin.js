const express = require('express');
const router = express.Router();

router.get('/adminLogin', (req, res) => {
    if(req.session.token == undefined){
        return res.render("admin/A_login");
    }
    res.render('admin/A_index')
})

router.get('/adminProfile', (req, res) => {
    if(req.session.token == undefined){
        return res.redirect("/adminLogin");
    }
    res.render('admin/A_profile');
})

router.get('/adminRegister', (req, res) => {
    res.render('admin/A_register')
})

router.get("/forgetPass",(req,res)=>{
    res.render( 'admin/A_forgetPassword' );
})

router.get('/adminIndex', (req, res) => {
    if(req.session.token == undefined){
        return res.redirect("/adminLogin");
    }
    res.render('admin/A_index',{
        token:req.session.token
    })
})

router.get('/adminAdduser', (req, res) => {
    if(req.session.token == undefined){
        return res.redirect("/adminLogin");
    }
    res.render('admin/A_adduser',{
        token:req.session.token
    })
})

router.get('/notification', (req, res) => {
    if(req.session.token == undefined){
        return res.redirect("/adminLogin");
    }
    res.render('admin/A_FCM_notification',{
        token:req.session.token
    })
})

router.get('/addproduct', (req, res) => {
    if(req.session.token == undefined){
        return res.redirect("/adminLogin");
    }
    res.render('admin/A_addproduct',{
        token:req.session.token
    })
})

router.get("/A_logout",(req,res)=>{
    res.render('admin/A_logout');
})

router.get('/Aloader', (req, res) => {
    res.render('admin/loader')
})

router.get('/A_useractivity', (req, res) => {
    if(req.session.token == undefined){
        return res.redirect("/adminLogin");
    }
    res.render('admin/A_useractivity',{
        token:req.session.token
    })
})

module.exports = router