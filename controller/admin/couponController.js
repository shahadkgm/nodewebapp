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

const createCoupon = async (req, res) => {
    try {
        const data = {
            couponName: req.body.couponName,
            startDate: new Date(req.body.startDate + "T00:00:00"),
            endDate: new Date(req.body.endDate + "T00:00:00"),
            offerPrice: parseInt(req.body.offerPrice),
            minimumPrice: parseInt(req.body.minimumPrice),
        };

        const existingCoupon = await Coupon.findOne({ name: data.couponName });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: "Coupon with this name already exists.",
            });
        }

        const newCoupon = new Coupon({
            name: data.couponName,
            createdOn: data.startDate,
            expireOn: data.endDate,
            offerPrice: data.offerPrice,
            minimumPrice: data.minimumPrice,
        });

        await newCoupon.save();

        return res.status(200).json({
            success: true,
            message: "Coupon created successfully",
            redirect: "/admin/coupon",
        });
    } catch (error) {
        console.error("Error in createCoupon", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the coupon.",
            redirect: "/admin/pageerror",
        });
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
const updateCoupon = async (req, res) => {
    try {
        const couponId = req.body.couponId;
        const oid = new mongoose.Types.ObjectId(couponId);
        const selectedCoupon = await Coupon.findOne({ _id: oid });

        if (!selectedCoupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found.",
            });
        }

        const existingCoupon = await Coupon.findOne({
            name: req.body.couponName,
            _id: { $ne: oid },
        });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: "A coupon with this name already exists.",
            });
        }

        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);

        const updatedCoupon = await Coupon.updateOne(
            { _id: oid },
            {
                $set: {
                    name: req.body.couponName,
                    createdOn: startDate, // Fixed typo: CraetedOn -> createdOn
                    expireOn: endDate,
                    offerPrice: parseInt(req.body.offerPrice),
                    minimumPrice: parseInt(req.body.minimumPrice),
                },
            },
            { new: true }
        );

        if (updatedCoupon.modifiedCount > 0) {
            return res.status(200).json({
                success: true,
                message: "Coupon updated successfully",
                redirect: "/admin/coupon",
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Failed to update the coupon. No changes were made.",
            });
        }
    } catch (error) {
        console.error("Error in updateCoupon:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the coupon.",
            redirect: "/admin/pageerror",
        });
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