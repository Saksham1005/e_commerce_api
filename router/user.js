const express=require('express')
const router=new express.Router()
const multer=require('multer')
const sharp=require('sharp')

const auth=require('../middleware/auth')
const {welcomeEmail,DeleteAccountEmail}=require('../emails/account')

const User=require('../models/users')

// router.get('',async(req,res)=>{

//     try {
//         const users=await User.find({})
//         res.send(users)
//     } catch (e) {
//         res.status(500).send(e)        
//     }
// })

router.post('/users/create',async(req,res)=>{
    const user=new User(req.body)
    try {
        await user.save()
        const token=await user.generateAuthToken()
        //debugger
        // console.log(user.password);
        welcomeEmail(user.email)
      res.status(201).send({user,token})  
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/login',async(req,res)=>{
    try {
        const user=await User.findByCredentials(req.body.email,req.body.password)
        
        // const user=await User.findOne({email:req.body.email})
        // console.log(user);
        const token =await user.generateAuthToken()
        // console.log(token);
        res.status(200).send({user,token})
    } catch (e) {
        res.status(400).send("error")
    }
})

router.get('/users/logout',auth,async(req,res)=>{
    try {
        req.user.tokens=req.user.tokens.filter((token)=>token.token!==req.token)
        // console.log(req.user);
        await req.user.save()
        res.send("Logout user")
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/logout/all',auth,async(req,res)=>{
    try {
        req.user.tokens=[]
        await req.user.save()
        res.status(200).send("Logout all tokens")
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/users/profile',auth,async(req,res)=>{
    // const id=req.params.id
    try {
        // const user=await User.findById({_id:id}) 
        res.status(200).send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/users/profile/update',auth,async(req,res)=>{
    // const _id=req.params.id
    const allowed_update=["name","age","email","password"]
    try {
        const updates=Object.keys(req.body)
        const isValidOperation=updates.every((update)=>allowed_update.includes(update))
        
        if(!isValidOperation){
            return res.status(400).send({error:"Invalid Updates!!"})
        }
        
        // const user=await User.findByIdandUpdate({_id:id},{...req.body}) 
        // const user=await User.findById(_id)
        updates.every((update)=>{
            req.user[update]=req.body[update]
        })
        await req.user.save()
        res.status(200).send(req.user)
    } catch (e) {
        res.status(400).send()
    }
})

router.delete('/users/profile/delete',auth,async(req,res)=>{
    // const _id=req.params.id
    try {
        // const user=await User.findById(_id)
        DeleteAccountEmail(req.user.email)
        await User.deleteOne(req.user)
        res.send("Your profile is deleted!!")
    } catch (e) {
        res.status(404).send()
    }
})

//Uploading profile pic or pics
const upload=multer({
    limits:{
        fileSize:3000000
    },
    fileFilter(req,file,cb){
        if(file.originalname.search('.jpg'||'.png')!==file.originalname.length-4
        && file.originalname.search('.jpeg')!==file.originalname.length-5){
            cb(new Error('File cannot be accepted!! Not a jpg or png or jpeg file'))
        }
        cb(undefined,true)
    }
})

//Creating the profile picture

// router.post('/upload',upload.array('profile_pic',2),(req,res)=>{
router.post('/upload/profile/pic',auth,upload.single('profile_pic'),async(req,res)=>{   
    try {
        const buffer=await sharp(req.file.buffer).resize({width:250}).jpeg({quality:100}).toBuffer()
        req.user.avatar=buffer
        await req.user.save()
        res.send("Your profile pic is uploaded successfully!!")
    } catch (error) {
        res.status(404).send()
    }
})

//Read the profile pic
router.get('/read/profile/:id/pic',async(req,res)=>{
    const _id=req.params.id
    try {
        const user=await User.findOne({_id})
        if(!user || !user.avatar){
            throw new Error()
        }

      res.set('Content-Type','image/jpeg')
      res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})



//Delete the profile picture
router.delete('/delete/profile/pic',auth,async(req,res)=>{
    try {
        req.user.avatar=undefined
        await req.user.save()
        res.send("Your profile pic is deleted successfully!!")
    } catch (error) {
        res.status(404).send()
    }
})
module.exports=router