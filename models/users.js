const mongoose=require('mongoose')
const validator=require('validator')
const jwt = require('jsonwebtoken')
const bcrypt=require('bcrypt')

const User_schema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        lowercase:true
    },
    age:{
        type:Number,
        required:false,
        trim:true,
        default:"20"
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error()
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes("password")){
            throw new Error("The password mentioned cannot contain 'password' !")
            }
            else if(value.length<8){
                throw new Error()
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer,
        required:false
    }
})

User_schema.virtual('items',{
    ref:'Item',
    localField:"_id",
    foreignField:"owner.user_id"
})

User_schema.methods.toJSON=function(){
    const user=this

    const obj=(user).toObject()

    delete obj.password
    delete obj.email
    delete obj.avatar

    return obj
}

//Defining the methods for an individual users
User_schema.methods.generateAuthToken=(async function(){
    const user=this
    const token=jwt.sign({_id:(user._id).toString()},process.env.JWT_SECRET,{expiresIn:'7 days'})
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
})



// Defining the methods for User model
// User_schema.statics.authenticateEmailAndPassword=async function(email,password){
    
//         const user=await User.findOne({email})
//         if(!user){
//             throw new Error()
//         }
//         console.log(password+"-> "+await bcrypt.hash(password,8));
//         if(!await bcrypt.compare(password,user.password)){
//             // console.log(password+"-> "+await bcrypt.hash(password,8) +"\n  -  "+user.password);
//             // console.log("not equal");
//             throw new Error()
//         }

//     return user
// }

User_schema.statics.findByCredentials=async function (email,password){
    const user=await User.findOne({email})
//    console.log(user);
    if(!user){
      throw new Error("Unable to login!!")
    }
     
    // if(email==user.email && await bcrypt(password,8)==user.password){
     //     return true
     // }
        //  console.log(password+"-> "+await bcrypt.hash(password,8));
    // console.log(user.password);
     const isMatch= await bcrypt.compare(password,user.password)
     console.log(isMatch);
     if(!isMatch){
       throw new Error("Unable to login")
     }
   
     return user
   
   }

User_schema.pre('save',async function(next){
    const user=this
    if(user.isModified("password")){
        user.password=await bcrypt.hash(user.password,8)
        console.log("Password is hashed now!!");
    }
    next()
})
const User=mongoose.model('User',User_schema)

module.exports=User