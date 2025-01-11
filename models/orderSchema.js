const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid'); // Corrected 'uuiid' to 'uuid'

// Define a schema with a UUID field
const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        default:()=> uuidv4() ,
        unique:true
    },
    orderedItems:[{
        product:{
            type:Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        price:{
            type:Number,
            default:0
        },
    

    }],
    totalprice:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        default:0
    },
    finalAmount:{
        type:Number,
        default:0
    },
    address:{
        type:Schema.Types.orderId,
        ref:'User',
        required:true
    },
    invoiceDate:{
        type:Date

    },
    status:{
        type:String,
        required:true,
        enum:['pending','proccessing','shipped','delivered','cancelled','return request ','returned']
    },
    createOn:{
        type:Date,
        default:Date.now,
        required:true

    },
    couponApplied:{
        type:Boolean,
        default:false

    }

    
});


const order = mongoose.model('order', orderSchema);
module.exports = order;
