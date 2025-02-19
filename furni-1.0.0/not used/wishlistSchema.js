const mongoose=require("mongoose");
const {schema}=mongoose;

const wishlistSchema= new schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,

    },
    products:[{
        productId:{
          type:Schema.Types.ObjectId,
          ref:'Product',
          required:true
        },
        addedOn:{
            type:Date,
            default:Date.now,

        }
    }]
})
const Wishlist=mongoose.model('Wishlist',wishlistSchema);
module.exports=Wishlist;