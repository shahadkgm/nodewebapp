const express = require('express');
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("./config/passport");
dotenv.config();
const db = require("./config/db");
const userRouter = require("./routes/user.Routes");
const adminRouter = require("./routes/adminRouter");
const cors = require("cors");


db();




const app = express();


app.use(cors());
app.use(cors({
  origin: "http://localhost:3003", 
  methods: "GET,POST,PUT,DELETE", 
  allowedHeaders: "Content-Type,Authorization" 
}));

app.use(express.json());  
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    },
  })
);

// Disable caching
app.use((req, res, next) => {
  res.set('cache-control', 'no-store');
  next();
});

app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, 'views/user'), path.join(__dirname, 'views/admin')]);
app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(passport.initialize());
app.use(passport.session());

// Define routes
app.use('/', userRouter);
app.use('/admin', adminRouter);

// Catch-all handler for 404 errors (Route Not Found)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack); 
  res.status(500).json({
    success: false,
    message: 'Something went wrong! Please try again later.',
  });
});

app.listen(3003, () => console.log('Server running on port 3003'));
