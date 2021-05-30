const express=require('express')
require('./mongoose/mongoose')
// const mongoose=require('mongoose')
const path=require('path')
const user_router=require('./router/user')
const item_router=require('./router/items')

const port=process.env.PORT

const app=express()

app.use(express.json())
app.use(user_router)
app.use(item_router)

// const public_directories=path.join(__dirname,'/public')

// //Applying the middlewares to the express
// app.use(express.static(public_directories))

// app.get('',(req,res)=>{
    
// })
app.get("",(req,res)=>{
    res.send({hello:"Hello postman"})
})

app.listen(port,()=>{
    console.log("Server is on port "+ port);
})