const mongoose=require("mongoose");
const {schema}=mongoose;

const addressSchema =new schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",   
    },
    address:[{
        addressType:{
            type:String,
            required:true,
        },
        name:{
            type:String,
            required:true,
        },
        city:{
            type:String, 
            required:true
        },
        state:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true,

        },
        phone:{
            type:String,
            required:true 
        },
        altphone:{
            type:String,
            required:true,

        }
    }]
})

const Address=mongoose.model("Address",addressSchema);
module.exports=Address;