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

    const {name,email,date,logintime,logouttime} = req.body;

    const insert_data = {
        name:name,
        email:email,
        date:date,
        logintime:logintime,
        logouttime:logouttime,
        adminId:req.user.id
    }

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
  
}

module.exports = {
    addActivity,getActivity,getExcel,getCsv
}