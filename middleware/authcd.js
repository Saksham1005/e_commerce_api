const bcrypt=require('bcrypt')

const authcd=async function(req,res,next){
    try{
    let token=req.header('Authorization').replace('Bearer ','')
    //console.log(typeof(token));
    // const password=await bcrypt.hash("456@WOD2990",8)
    // console.log(await bcrypt.hash(token,8),"   ",password);
    // if(!await bcrypt.compare(token,password)){
    token=await bcrypt.hash(token,8)
    // console.log(await bcrypt.compare(process.env.SELLER_TOKEN,token));
    if(!await bcrypt.compare(process.env.SELLER_TOKEN,token)){
    // if(token!==process.env.SELLER_TOKEN){   
        console.log("NO");
    throw new Error("Access not granted")
    }

    req.message="Access granted"
    next()
    }
    catch(error){
        res.status(404).send("Authorization error")   
    }
}

module.exports=authcd