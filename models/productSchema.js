const mongoose=require("mongoose");
const {Schema}=mongoose;
const productSchema=new Schema({
    productName:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    
    category:{
        type:Schema.Types.ObjectId,
        ref:"Category",
        required:true,

    },
    regularPrice:{
        type:Number,
        required:true
    },
    saleprice:{
        type:Number,
        required:true
    },
    productOffer:{
        type:Number,
        default:0,
    },
    quantity:{
        type:Number,
        default:true
    },
    color:{
        type:String,
        required:true
    },
    productImage:{
        type:["string"],
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum:["Available","out of stock","Discountinued"],
        required:true,
        default:"Availabe"
    },

},{timestamps:true});
const product=mongoose.model("product",productSchema);
module.exports=product;