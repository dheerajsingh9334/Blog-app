const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`DB connected successfully`);
  } catch (error) {
    console.log(`Error connecting to Mongodb ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
