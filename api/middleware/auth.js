const jwt = require('jsonwebtoken');
const { errorRes } = require("../res/msgcode");

const tokenCheck = async(req,res,next)=>{
    try {
        const  bearerToken = req.headers.authorization; 
        if(!bearerToken){
                return errorRes(res,201,"Please Provide Token");
        }
        const token = bearerToken.replace('Bearer ', '');
        const user = await jwt.verify(token,process.env.SECRETKEY);

        if(user){
            req.user = user;
            return next();
        }else{
            return errorRes(res,201,"Token doesn't Valid");
        }
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return errorRes(res,401,"Token is Expired");
        } else if (error.name === 'JsonWebTokenError') {
            return errorRes(res,401,"Token is Invalid");
        } else {
            return errorRes(res,401,"Token Verification Failed");
        }
    }
}

module.exports = {tokenCheck};

