express = require('express');
const router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const auth = require('../middleware/auth');
const userController = require('../controllers/C_user');
const multer = require('multer');
const user = require('../model/M_user');
const userActivity = require('../model/M_useractivity');
const XLSX = require('xlsx');

const uploadFile = multer({ storage: multer.memoryStorage() }); 
router.post('/uploadData', auth.tokenCheck,uploadFile.single('fileData'), async(req, res) => {    
    try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet_name_list = workbook.SheetNames;
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        const inputFileds = ['name','email','date','logintime','logouttime'];
           
        if(!data){
          return res.json({msg:"data error"});
        }

        for (let x in data[0]){
            if(!inputFileds.includes(x.toLowerCase())) {
              return res.json({msg:"filed is not valid"})
            }
        }
  
        await Promise.all(data.map(async (item) => {
            const insert_data = {
               name:item.name,
               email:item.email,
               date:item.date,
               logintime:item.logintime,
               logouttime:item.logouttime,
               adminId:req.user.id
            };

            const res_add = new userActivity(insert_data);
            await res_add.save();
        }));
        res.status(200).json({ message: 'File uploaded and processed successfully.' });
    } catch (error) {
        console.log("Error from the /upload route >>> ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post("/addactivity",multipartMiddleware,userController.addActivity);
router.get("/getactivity",auth.tokenCheck,userController.getActivity);
router.get("/downloadExcel",userController.getExcel);
router.get("/downloadCsv",userController.getCsv);

router.post("/userlogin",multipartMiddleware,userController.userLogin);
router.get("/getuser",auth.tokenCheck,userController.getUser);
router.get("/otpemail",userController.sendEmailForForgetPassword);
router.post("/forgetpassword",multipartMiddleware,userController.forgetPassword);
router.post("/changeUserPassword",auth.tokenCheck,multipartMiddleware,userController.changePassword);


router.post("/address", auth.tokenCheck,multipartMiddleware,userController.addAddress);
router.get("/address",auth.tokenCheck,userController.getAddress);
router.patch("/address",auth.tokenCheck,multipartMiddleware,userController.editAddress);


module.exports = router;