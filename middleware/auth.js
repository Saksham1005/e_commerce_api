const User=require('../models/users')
const jwt=require('jsonwebtoken')

const auth=async function(req,res,next){
    
    try {
        const token=req.header("Authorization").replace("Bearer ","");
        const decode= jwt.verify(token,process.env.JWT_SECRET)
        // console.log(decode);
        let user=await User.findOne({_id:decode._id,'tokens.token':token})
        // console.log(user); 
        if(!user){
            throw new Error()
        }
        req.user=user
        req.token=token   
        
        next()
    } catch (e) {
        res.status(401).send({error:"Please authenticate.",e})
    }
    
}

module.exports=auth