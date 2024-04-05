const admin = require('../model/M_admin');
const {errorRes,successRes} = require('../res/msgcode');
const multer = require('multer');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require('nodemailer');
const user = require('../model/M_user');
const fs = require('fs')
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/') // Directory where files will be stored
    },
    filename: function (req, file, cb) {
      cb(null, `${req.body.name}-${file.originalname}`) // Use original file name
    }
});

const upload = multer({ storage: storage });

const addadmin = async(req,res)=>{
    try {
        const {name,email,password} = req.body;

        if(!req.body){
            return errorRes(res,201,"Please Provide data")
        }

        const insert_data = {
            name:name,
            email:email,
            password:password,
            profile_photo:req.file.filename
        }

        const res_add = new admin(insert_data);

        res_add.save()
            .then(async(result) => {
                const token = await jwt.sign({ id: result._id.toString() },process.env.SECRETKEY, { expiresIn: "10 hours" });
                req.session.token = token;
                return res.json({token:token,success:true});
            })
            .catch((error) => {
                console.log("Error >>>>> ", error.message);
                return errorRes(res, 500, "Some Internal Error");
        });
    } catch (error) {
        res.send("some internal error");
    }
}

const adminlogin = async (req,res)=>{
    try {
        const {email , password}=req.body;
        const login_data = {
            email:email,
            password:password,
        }

        const adminRes = await admin.find(login_data);

        if(adminRes.length > 0){
            const token = await jwt.sign({ id: adminRes[0]._id.toString() },process.env.SECRETKEY, { expiresIn: "10 hours" });
            req.session.token = token;
            return res.send({token:token,available:true});
        }else{
            res.json({ available: false });
        }
    } catch (error) {
        console.log("Error from the adminLogin >>>>>",error.message);
    }

}

const adminlogout = async(req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).send('Error destroying session');
      }
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Expires', '0');
        res.setHeader('Pragma', 'no-cache');
        res.redirect('/A_logout');
    });
}

const checkavlemail = async (req,res)=>{
    let {email} = req.query;
    const data = await admin.findOne({email : email})
    if(data){
        return res.send({available : true})
    }
    else{
        return res.send({available : false})
    }  
}

const sendEmail = async(req,res)=>{

    const email = req.query.email;

    async function generateOTP() {
        var otp = "";
        for (var i = 0; i < 6; i++) {
            otp += Math.floor(Math.random() * 10);
        }
        return otp;
      }
      
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587, 
        secure: false,
        auth: {
          user: 'patelparth682841@gmail.com',
          pass: 'vahe pkqx sinx qzja',
        },
    });

    let OTP =  await generateOTP();
    
    const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Email</title>
    <style>
    /* Bootstrap CSS */
    .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .btn {
        display: inline-block;
        font-weight: 400;
        color: #212529;
        text-align: center;
        vertical-align: middle;
        user-select: none;
        background-color: #f8f9fa;
        border: 1px solid transparent;
        padding: 0.375rem 0.75rem;
        font-size: 1rem;
        line-height: 1.5;
        border-radius: 0.25rem;
        transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        text-decoration: none;
    }
    
    .btn-primary {
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
    }
    
    .btn-primary:hover {
        color: #fff;
        background-color: #0056b3;
        border-color: #0056b3;
    }
    
    </style>
    </head>
    <body>
    <div class="container">
        <h2>One-Time Password (OTP)</h2>
        <p>Your One-Time Password (OTP) is: <strong style='font-size:15px;'>${OTP}</strong></p>
        <p>Please use this OTP to proceed with your action.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
    </div>
    </body>
    </html>
    `
    
    const mailOptions = {
        from: 'patelparth682841@gmail.com',
        to: email,
        subject: 'Password Reset',
        html: template,
    };
    
    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return errorRes(res,201,"Email is not sent")
        }
        return res.json({"otp":OTP});
    });    
}

const sendEmailPassword = async(email,password,name)=>{
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587, 
        secure: false,
        auth: {
          user: 'patelparth682841@gmail.com',
          pass: 'vahe pkqx sinx qzja',
        },
    });

    const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Account Details</title>
    <style>
        /* Reset CSS */
        body, html {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            line-height: 1.6;
        }
        /* Container Styles */
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        /* Header Styles */
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #333;
            margin-top: 0;
        }
        /* Content Styles */
        .content {
            margin-bottom: 20px;
        }
        .content p {
            margin: 10px 0;
        }
        /* Button Styles */
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
        }
        .btn:hover {
            background-color: #0056b3;
        }
    </style>
    </head>
    <body>
    <div class="container">
        <div class="header">
            <h1>Your Account Details</h1>
        </div>
        <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for creating an account with us. Here are your login details:</p>
            <table border="2">
                <tr>
                    <td style="background-color: burlywood;"><p><strong>Email:</strong></p></td>
                    <td><p>${email}</p></td>
                </tr>
                <tr>
                    <td style="background-color: burlywood;"><p><strong>Password:</strong> </p></td>
                    <td><p>${password}</p></td>
                </tr>
            </table>
            <p>Please keep this information secure and do not share it with anyone.</p>
            <p>If you have any questions or concerns, feel free to <a href="[Your Contact Page URL]" class="btn">Contact Us</a>.</p>
            <p>Best regards,<br>Your Company Name</p>
        </div>
    </div>
    </body>
    </html>    
    `

    const mailOptions = {
        from: 'patelparth682841@gmail.com',
        to: email,
        subject: 'Your email and password Information',
        html: template,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.log('Error sending email and password:', error);
            return errorRes(res,201,"Email is not sent")
        }
    });
} 

const updatePassword = async (req,res)=>{
    const {email,password} = req.body;

    const idres = await admin.find({email:email},{_id:1});

    const id = idres[0]._id.toString();

    const updatePassword = await admin.findByIdAndUpdate({ _id: id }, {password:password} , { new: true });
    return res.json({success:true});
}

const checkAvl = async (req, res) => {
    try {
        const { email , mobile ,id } = req.query;

        if(email){
            const userres = await user.findOne({email : email,isDelete:false});
            if (userres) {
                if(id){
                    if(userres._id.toString() == id){
                        res.json({ available: false });
                    }else{
                        res.json({ available: true });
                    }
                }else if(userres){
                    res.json({ available: true });
                }else{
                    res.json({ available: false });
                }
            } else {
                res.json({ available: false });
            }
        }
        else if(mobile){
            const userres = await user.findOne({ mobile: mobile ,isDelete:false});
            if (userres) {
                if(id){
                    if(userres._id.toString() == id){
                        res.json({ available: false });
                    }else{
                        res.json({ available: true });
                    }
                }else if(user){
                    res.json({ available: true });
                }else{
                    res.json({ available: false });
                }
            } else {
                res.json({ available: false });
            }
        }

       
    } catch (error) {
        console.error('Error checking email availability:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


// with token

const getdetails = async(req,res)=>{

    const admindata = await  admin.findOne({_id : req.user.id});

    res.json(admindata);
}

const addUser = async (req,res)=>{
    const {name,email,mobile,gender,address} = req.body;

    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';

    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    const insert_data = {
        name : name,
        email : email,
        mobile : mobile,
        gender : gender,
        address : address,
        userProfile:req.file.filename,
        password : password,
        adminId: req.user.id
    };

    const res_add = new user(insert_data);

    res_add.save()
        .then(async(result) => {
            sendEmailPassword(insert_data.email,insert_data.password,insert_data.name)
            return res.json({success:true});
        })
        .catch((error) => {
            console.log("Error >>>>> ", error.message);
            return errorRes(res, 500, "Some Internal Error");
    });
}

const getUserDetails = async(req,res)=>{

    const admindata = await  user.find({adminId : req.user.id,isDelete:false}).sort({_id:-1});

    res.json(admindata);

}

const deleteUser = async(req,res)=>{
    const id = req.query.id;

    const deletedata = await user.findByIdAndUpdate(id,{isDelete: true},{new:true})

    return res.json({success:true});
}

const updateUser = async(req,res)=>{
    const id = req.params.id;

    const {email,password,name} = req.body; 

    console.log(req.body);

    sendEmailPassword(email,password,name);

    if(req.file){
        const photoName = await user.findOne({_id:id},{_id:0,userProfile:1})
        const PathDelete = path.join(__dirname,`../uploads/${photoName.userProfile}`);
        fs.unlinkSync(PathDelete);
        const updateStudents = await user.findByIdAndUpdate({ _id: id }, {...req.body,userProfile:req.file.filename}, { new: true });

        return res.json({success:true});

    }else{
        const updateStudents = await user.findByIdAndUpdate({ _id: id }, req.body, { new: true });
        return res.json({success:true});
    }

}

module.exports = {
    addadmin,upload,adminlogin,adminlogout,checkavlemail,sendEmail,updatePassword,getdetails,addUser
    ,getUserDetails,deleteUser,checkAvl,updateUser
}