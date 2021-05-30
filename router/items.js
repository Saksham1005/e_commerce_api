const Item=require('../models/items')
const express=require('express')
const router=new express.Router()
const auth=require('../middleware/auth')
const User=require('../models/users')
const authcd=require('../middleware/authcd')

router.post('/create/items',authcd,async(req,res)=>{
    try {
        let array=[]
        for(let i in req.body){
            // console.log(i);
            
            let item=undefined
            item=new Item(req.body[i])
            array.push(item)
            await item.save()
        }
        res.status(201).send({message:req.message,array})
    } catch (error) {
        res.status(404).send({error,message:"No"})
    }
})

router.delete('/delete/items',authcd,async(req,res)=>{
    try {

        let items=[]
        for(let i in req.body){
            items.push(await Item.findOne(req.body[i]))
            await items[items.length-1].remove()
        }

        res.status(201).send({message:req.message,items})
    } catch (error) {
        res.status(404).send(error)
    }
})

////////////////////   User interface   /////////////////////////

//Available items
router.get('/items',async(req,res)=>{
    try {
        const items=await Item.find({})
        res.send(items)
    } catch (error) {
        res.status(500).send()
    }
})

//Select or delete items(done by the user)
router.patch('/me/select/items',auth,async(req,res)=>{
    try {
        
        for(let i in req.body){
            let item=undefined
            item=await Item.findOne(req.body[i])

            for(let x of item.owner){
                if(x.user_id.toString()===req.user._id.toString()){
                    res.status(400).send("This item already belongs to you")
                    return
                    // throw new Error('This item already belongs to you')
                }
            }

            item.owner.push({user_id:req.user._id})
            await item.save()
        }
    
        
        await req.user.populate('items').execPopulate()
        
        res.send(req.user.items)
    } catch (error) {
        res.status(404).send(error)
    }

})

//Get items selected by the user
router.get('/me/items',auth,async(req,res)=>{
    //const items=await Item.find({});
    try {
        const sort={}
        if(req.query.sortBy){
            const value=req.query.sortBy.split(':')
            //console.log(value);
            sort[value[0]]=(value[1]==='desc')? -1 : 1
        }
        await req.user.populate({
            path:'items',
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
       // await req.user.populate('items').execPopulate()
        res.send(req.user.items)
    } catch (error) {
        res.status(404).send()
    }
})

router.delete('/me/delete/item',auth,async(req,res)=>{
    try {
        const name=req.query.name
        const item=await Item.findOne({name,'owner.user_id':req.user._id})
        item.owner=item.owner.filter((id)=>{
            if(id.user_id.toString()!==req.user._id.toString()){
                return id
            }
        })
        await item.save()
        await req.user.populate('items').execPopulate()

        res.send(req.user.items)
    } catch (error) {
        res.status(400).send()
    }    
})

module.exports=router