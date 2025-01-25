const express = require('express');
const path=require("path")
const dotenv=require("dotenv");
const session=require("express-session")
const passport=require("./config/passport")
dotenv.config();
const db=require("./config/db")
const userRouter=require("./routes/user.Routes")
const adminRouter=require("./routes/adminRouter")
db()


const app = express();
app.use(express.json());  // For JSON requests
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, 
    resave: false,
     saveUninitialized: true,
      cookie: {
         secure: false,
         httpOnly:true,
         maxAge:72*60*60*1000

       },
      

}))
app.use((req,res,next)=>{
    res.set('cache-control','no-store')
    next();
})



app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, 'views/user'),path.join(__dirname,'views/admin')]);
app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(passport.initialize());
app.use(passport.session());

 
app.use((req,res,next)=>{
    res.set('cache-control','no-store')
    next()
});




app.use('/', userRouter);
app.use('/admin',adminRouter)


app.listen(3003, () => console.log('Server running on port 3003'))