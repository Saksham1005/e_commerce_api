const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcrypt')

const item_Schema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    price:{
        type:Number,
        required:true
    },
    // password:{
    //     type:String,
    //     trim:true,
    //     required:true,
    //     validate(value){
    //         if(value.length<8){
    //             throw new Error()
    //         }
    //     }
    // },
    reviews:[{
        review:{
            type:String,
            required:false,
            trim:true,
        },
        user_id:{
            type:String,
        }
    }],
    owner:[{
        user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
        }
    }]
},{
    timestamps:true
})

item_Schema.methods.toJSON=function(){
    const items=this

    const obj=items.toObject()
    
    delete obj.owner
    // delete obj.reviews
    return obj
}

// item_Schema.pre('save',async function(next){
//     const user=this
    
//     next()
// })

const Item=mongoose.model('Item',item_Schema)

module.exports=Item