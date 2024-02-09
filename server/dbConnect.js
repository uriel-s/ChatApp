const mongoose = require("mongoose");
require('dotenv').config()


async function dbConnect() {
  const uri = process.env.MONGODB_URI; // Make sure to set this in your .env file
mongoose.connect(uri)
    .then(() => console.log("Mongoose is connected"))
     .catch(err => console.error("Mongoose connection error:", err));

// Mongoose connection events
mongoose.connection.on('error', err => {
  console.error(`Mongoose connection error: ${err}`);
  process.exit(1);
});
}

module.exports = dbConnect;