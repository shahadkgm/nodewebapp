const mongoose = require("mongoose");
const env = require("dotenv").config();
const connectDB = async () => {
  try {
    const mongo = await mongoose.connect(process.env.MONGODB_URI)
    console.log(mongo.connection.name)
    console.log(mongo.connection.host)
    console.log("db connected succsesfully")
  } catch (error) {

    console.error("DB connection error:", error); process.exit(1);
  }

}
module.exports = connectDB;  