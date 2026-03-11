console.log("db.js file loaded ✅");
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
mongoose.set('debug', true);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb://localhost:27017/"
    );

    console.log(`MongoDB Connected: ${conn.connection.host} ✅`);
  } catch (error) {
    console.error("MongoDB connection failed ❌");
    console.error(error && error.stack ? error.stack : error);
    // don't exit the process here so we can inspect logs while server stays up
  }
};

mongoose.connection.on('connected', () => {
  console.log('Mongoose event: connected');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose event: error', err && err.message ? err.message : err);
});

module.exports = connectDB;
