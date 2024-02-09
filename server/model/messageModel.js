const mongoose = require("mongoose");


// messageId, senderId, recipentId, text, viewed: false
const MessageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: [true, "Please provide a senderId!"],
        unique: false,
      },
      recipientId: {
        type: String,
        required: [true, "Please provide a recipentId!"],
        unique: false,
      },
    
      text: {
        type: String,
        required: [true, "Please provide a message text!"],
      },

      isViewed: {
        type: Boolean,
        default: false
      },
  })


//The code above is saying: "create a message table or collection if there is no table with that name already".
  module.exports = mongoose.model.Message || mongoose.model("Message", MessageSchema);