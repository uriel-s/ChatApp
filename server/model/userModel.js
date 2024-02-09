const mongoose = require("mongoose");



const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a Name!"],
        unique: false,
      },
    email: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: true, 
      },
    
      password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
      },
  })


//The code above is saying: "create a user table or collection if there is no table with that name already".
  module.exports = mongoose.model.Users || mongoose.model("User", UserSchema);