const { query } = require("express");
const User=require("../../models/userschema");

const customerInfo = async (req, res) => {
    try {
        let search = req.query.search || ""; // 
        let page = parseInt(req.query.page) || 1; 
        const limit = 5; 
        const userData = await User.find({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        })
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        const count = await User.countDocuments({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        });

        const totalPages = Math.ceil(count / limit);

        res.render("customers", {
            data: userData,
            totalPages: totalPages,
            currentPage: page,
            totalCount: count,
            searchQuery: search, 
        });

    } catch (error) {
        console.error("Error fetching customer data:", error);
        res.status(500).send("An error occurred while retrieving customer data.");
    }
};

const customerBlocked=async(req,res)=>{
    try {
        let id=req.query.id;
        await User.updateOne({_id:id},{$set:{isBlocked:true} });
        res.redirect("/admin/users")
    } catch (error) {
        res.redirect("/pageerror")
        
    }
} ;
const customerunBlocked=async(req,res)=>{
    try {
       let id= req.query.id;
       await User.updateOne({_id:id},{$set:{isBlocked:false}});
       res.redirect("/admin/users")
    } catch (error) {
        console.log("error in user unblocking");
        res.redirect("/pageerror")
        
    }
};

module.exports={
    customerInfo,
    customerBlocked,
    customerunBlocked,
}