const Coupon = require("../../models/couponSchema");
const mongoose=require("mongoose")




const getCoupon=async (req,res)=>{
    try {
        const admin=req.session.admin;
        const findCoupons=await Coupon.find({});

        return res.render("coupon-manage",{coupon:findCoupons,admin})
        
    } catch (error) {
        console.error("error from ",error)
        res.redirect("/pageNotfount")
        
    }
};

const createCoupon=async(req,res)=>{
    try {
        const data={
            couponName:req.body.couponName,
            startDate:new Date(req.body.startDate + "T00:00:00"),
            endDate:new Date(req.body.endDate + "T00:00:00"),
            offerPrice:parseInt(req.body.offerPrice),
            minimumPrice:parseInt(req.body.minimumPrice),

        }
        const newCoupon=new Coupon({
            name:data.couponName,
            createdOn:data.startDate,
            expireOn:data.endDate,
            offerPrice:data.offerPrice,
            minimumPrice:data.minimumPrice,


        })
        await newCoupon.save();
        return res.redirect("/admin/coupon")
    } catch (error) {
        console.error("error in createCoupon",error)
        res.redirect("/admin/pageerror")
        
    }

};
const editCoupon=async(req,res)=>{
    try {
        const admin=req.session.admin
        const id=req.query.id;
        const findCoupon=await Coupon.findOne({_id:id});
        res.render('edit-coupon',{
            findCoupon:findCoupon,admin
        })

    } catch (error) {
        console.error("error from edit",error);
        res.redirect("/admin/pageerror")
        
    }
};
const updateCoupon=async(req,res)=>{

    try {
        const couponId=req.body.couponId;
        const oid=new mongoose.Types.ObjectId(couponId);
        const selectedCoupon=await Coupon.findOne({_id:oid})
        if(selectedCoupon){
            const startDate=new Date(req.body.startDate);
            const endDate=new Date(req.body.endDate);
            const updateCoupon=await Coupon.updateOne(
                {_id:oid},
            {$set:{
                name:req.body.couponName,
                CraetedOn:startDate,
                expireOn:endDate,
                offerPrice:parseInt(req.body.offerPrice),
                minimumPrice:parseInt(req.body.minimumPrice),
            },
        },{new:true}
        );
        if(updateCoupon!==null){
            res.send("Coupon updated successfully")
        }else{
            res.status(500).send("Coupon update failed")
        }
        }


        
    } catch (error) {
        res.redirect("/admin/pageerror")
        console.error("error in update copon",error)
        
    }
};

const deleteCoupon=async(req,res)=>{
    try {
        const id=req.query.id;
        await Coupon.deleteOne({_id:id});
        res.status(200).send({success:true,message:"Coupon deleted successfully"})

    } catch (error) {
        console.error("error from delete-c",error)
        res.status(500).send({succuss:false, message:"failed to delete coupon"})
    }
}







module.exports={
    getCoupon,
    createCoupon,
    editCoupon,
    updateCoupon,
    deleteCoupon
}