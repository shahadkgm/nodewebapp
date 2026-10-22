const mongoose = require("mongoose");
const env = require("dotenv").config();
const connectDB = async () => {
  try {
    const mongo = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Database connected successfully: ${mongo.connection.name} (${mongo.connection.host})`);
  } catch (error) {
    console.error("Primary DB connection failed:", error.message);
    try {
      console.log("Connecting to local MongoDB fallback...");
      const localMongo = await mongoose.connect("mongodb://127.0.0.1:27017/nodewebapp");
      console.log(`Local DB connected successfully: ${localMongo.connection.name}`);
    } catch (localErr) {
      console.error("Local DB connection error:", localErr.message);
      process.exit(1);
    }
  }
};
module.exports = connectDB;  