const user = require('../model/M_user');
const csv = require('fast-csv');
const { createObjectCsvWriter } = require('csv-writer');
const {errorRes,successRes} = require('../res/msgcode');
const multer = require('multer');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require('nodemailer');
const userActivity = require('../model/M_useractivity');
const XLSX = require('xlsx')
const path = require('path');

const addActivity = async(req,res)=>{

    const {name,email,logintime,logouttime,adminId} = req.body;

    let currentDate = new Date();

    const insert_data = {
        name:name,
        email:email,  
        date:currentDate,
        logintime:logintime,
        logouttime:logouttime,
        adminId:adminId
    };

    const res_add = new userActivity(insert_data);
    res_add.save()
        .then(async(result) => {
            return res.json({success:true});
        })
        .catch((error) => {
            console.log("Error >>>>> ", error.message);
            return errorRes(res, 500, "Some Internal Error");
    });
}

const getActivity = async(req,res)=>{
    try {
        const  activityLists = await userActivity.find({adminId : req.user.id}).sort({date:-1})
        
        if(!activityLists){
           return errorRes(res,403,"No Data Found")
        }else{
          successRes(res,200,"List of user activity : ",activityLists)
        }  
    } catch (error) {
        console.log("Error from the getActivity : ",error);
    }
}

const getExcel = async (req, res) => {
    try {      
      const res_data = await userActivity.find().sort({ _id: -1 });
  
      const excelData = res_data.map(doc => ({
        name: doc.name,
        email: doc.email,
        date: doc.date,
        logintime:doc.logintime,
        logouttime:doc.logouttime,
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const filePath = path.join(__dirname, '../downloads/exported_data.xlsx');
      XLSX.writeFile(workbook, filePath);
      res.download(filePath);
    } catch (error) {
      console.error("Error downloading Excel file:", error);
      res.status(500).send("Error downloading Excel file");
    }
}

const getCsv = async (req, res) => {
    try {
    const res_data = await userActivity.find().sort({ _id: -1 });
  
      const csvHeader = [
        { id: 'name', title: 'name' },
        { id: 'email', title: 'email' },
        { id: 'date', title: 'date' },
        { id: 'logintime', title: 'logintime' },
        { id: 'logouttime', title: 'logouttime' },
      ];
  
      const downloadPath = path.join(__dirname, "../downloads/output.csv");
  
      const csvWriter = createObjectCsvWriter({
        path: downloadPath,
        header: csvHeader
      });
  
      csvWriter.writeRecords(res_data)
        .then(() => res.download(downloadPath))
        .catch(error => console.error('Error writing CSV file:', error));
  
    } catch (error) {
      console.log("Error from the download function >>> ", error);
    }
}

const userLogin = async(req,res) =>{
  
  const {email,password} = req.body;
  
  if(!email && !password){
    return errorRes(res,400,"Please provide all filed")
  }
  
  const reslogin = await user.findOne({email:email,password:password})

  if(reslogin){
    const token = await jwt.sign({ id: reslogin._id.toString() },process.env.SECRETKEY, { expiresIn: "10 hours" });
    return res.json({available:true,message:"User not available",token:token})
  }else{
    return res.json({available:false,message:"User available"})
  }
}

const  getUser = async(req,res)=>{
  try{
     let usersData=await user.find({_id:req.user.id});
     return successRes(res,200,'Successfully fetched data',usersData)
  }catch(err){
    console.log(object);
    return errorRes(res,500,'Server Error')
  }
}

const sendEmailForForgetPassword = async(req,res)=>{

  const email = req.query.email;

  const checkemailAval = await user.findOne({email:email});

  if (!checkemailAval) {
    return errorRes(res,404,"This Email is not registered");
  }

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
  });    
  return res.json({"otp":OTP});
}

const forgetPassword = async (req,res)=>{
  const {email,password} = req.body;

  const idres = await user.find({email:email},{_id:1});

  console.log(idres);

  const id = idres[0]._id.toString();

  const updatePassword = await user.findByIdAndUpdate({ _id: id }, {password:password} , { new: true });
  return res.json({success:true});
}

const changePassword = async (req,res)=>{
  const {oldpass,newpass} = req.body;
  id = req.user.id;
  const checkPassword = await user.findOne({_id : id , password : oldpass});

  if(!checkPassword){
      return errorRes(res,503,'Invalid Password')
  }

  const updatePassword = await user.findByIdAndUpdate(id,{password:newpass})

  if(updatePassword){
      return res.json({success:true});
  }else{
      return res.json({success:false});
  }

}


module.exports = {
    addActivity,getActivity,getExcel,getCsv,userLogin,getUser,sendEmailForForgetPassword,forgetPassword,changePassword
}