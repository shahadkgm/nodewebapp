const User=require("../models/userschema")

const userAuth=(req,res,next)=>{
    if(req.session.user){
        User.findById(req.session.user)
        .then(data=>{
            if(data){
                next();
            }else{
                res.redirect("/login")
            }
        })
        .catch(error=>{
            console.error("error in userAuth middleware",error);
            res.status(500).send("Internal server error")
        })
    }else{
        res.redirect("/login")
    }
}
const adminAuth=(req,res,next)=>{
    if(req.session.admin){
    User.findOne({isAdmin:true})
    .then(data=>{
        if(data){
            next();
        }else{
            res.redirect("/admin/login")
        }
    })
    .catch(error=>{
        console.error("error in adminauth middleware ",error)
        res.status(500).send("Internal Server Error")
    })}else{
        res.redirect("/admin/login")
    }
}

module.exports={
    userAuth,
    adminAuth,
}