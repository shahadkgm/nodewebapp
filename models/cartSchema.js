const mongoose=require("mongoose");
const {Schema}=mongoose;
const cartSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    items:[{
        productId:{
           type :Schema.Types.ObjectId,
           ref:'Product',
           required:true,

        },
        quantity:{
            type:Number,
            default:1
        },
        price:{
            type:Number,
            required:true,

        },
        totalPrice:{
            type:Number,
            required:true
        },
        status:{
            type:String,
            default:'placed'
        },
        cancellatioanReason:{
            type:String,
            default:'none'
        }

    }]
})
const cart=mongoose.model("cart",cartSchema);
module.exports=cart;