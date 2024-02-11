require("dotenv").config();
const express = require("express");
const cors = require("cors");
const socketIo = require("socket.io");
const app = express();
const bcrypt = require("bcrypt");
const http = require("http");

const dbConnect = require("./dbConnect");
const User = require("./model/userModel");
const Message = require("./model/messageModel");
const server = http.Server(app);

app.use(
  cors({
    origin: "*", //allaow any url to connect
  })
);
app.use(express.json());
// execute database connection
dbConnect();

const userSockets = {};
const port = process.env.PORT;

app.use(
  cors({
    origin: "*",
  })
);

app.post("/register", (req, res) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hashedPassword) => {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });
      User.findOne({ email: req.body.email }).then((find) => {
        if (find) {
          res.status(400).send({
            message: "email already exist",
          });
        } else {
          user
            .save({
              writeConcern: {
                j: true,
                wtimeout: 1000,
              },
            })
            .then((e) => {console.log("e = ",e);
              res.status(201).json({ id: e._id, name: e.name });
            })
            .catch((error) => {
              res.status(500).send({
                message: "Error creating user",
                error,
              });
            });
        }
      });
    })
    .catch((e) => {
      res.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

// Get all users
app.get("/getAllusers", (req, res) => {
  User.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      res.status(500).json({ message: "Error fetching users", error: error });
    });
});

app.post("/getMessage", async (req, res) => {
  try {
    const { recipientId, senderId } = req.body;

    // Find messages mongoose function
    const messages = await Message.find({
      $or: [
        { $and: [{ senderId: recipientId }, { recipientId: senderId }] }, // Messages from recipient to sender
        { $and: [{ senderId: senderId }, { recipientId: recipientId }] }, // Messages from sender to recipient
      ],
    });
    if (messages.length > 0) {
      // Update messages as viewed where the current user is the recipient
      await Message.updateMany(
        {
          recipientId: senderId, // The current user should be the recipient
          senderId: recipientId, // The other user is the sender
          isViewed: false, 
        },
        {
          $set: { isViewed: true },
        },
        { writeConcern: { j: true, wtimeout: 1000, w: "majority" } }
      );
    }

    // Return the found messages
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching messages", error: error });
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  //from db.collection.findOne()
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        console.log("no user");
        return false;
      }
      bcrypt
        .compare(password, user.password)
        .then((match) => {
          if (match) {
            res.status(200).json({ id: user.id, name: user.name });
          } else {
            res.status(401).json({ message: "Incorrect password" });
          }
        })
        .catch((error) => {
          console.log("password wrong");
          return false;
        });
    })
    .catch((error) => {
      console.log("no email wrong");
      return false;
    });
});

app.post("/logout", (req, res) => {
  res.status(200).send({ message: "Logout successful" });
});

// Get a single user by ID
app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    })
    .catch((error) => {
      res.status(500).json({ message: "Error fetching user", error: error });
    });
});

// Delete a user by ID
app.delete("/delete/:id", (req, res) => {
  const userId = req.params.id;
  User.findByIdAndDelete(userId, {
    writeConcern: {
      j: true,
      wtimeout: 1000,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res
        .status(200)
        .json({ message: "User deleted successfully", user: user });
    })
    .catch((error) => {
      res.status(500).json({ message: "Error deleting user", error: error });
    });
});

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  const io = socketIo(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("New user connected");

    // Handle user authentication
    socket.on("authenticate", (userId) => {
      console.log(`User ${userId} authenticated`);
      userSockets[userId] = socket; // Store the user's socket
    });


    socket.on("sendMessage", ({ text, senderName, senderId, recipientId }) => {
      console.log(`Received message for user ${recipientId}:`, text);
      const recipientSocket = userSockets[recipientId];
      const senderSocket = userSockets[senderId];

      // If the conversation is not active, leave isViewed as it is
      new Message({
        senderName,
        senderId,
        text,
        recipientId,
      })
        .save({
          writeConcern: {
            j: true,
            wtimeout: 1000,
          },
        })
        .then((messageObject) => {
          console.log(messageObject);
          senderSocket.emit("message", {
            text,
            senderName,
            senderId,
            recipientId,
            _id: messageObject.id,
            isViewed: messageObject.isViewed, // Leave isViewed as it is
          }); // Send the message to the sender
          if (recipientSocket) {
            recipientSocket.emit("message", {
              text,
              senderName,
              senderId,
              recipientId,
              _id: messageObject.id,
              isViewed: messageObject.isViewed, // Leave isViewed as it is
            }); // Send the message to the recipient
          } else {
            console.log(`User ${recipientId} not found or not connected`);
          }
        });
    });

    socket.on("messageViewed", async ({ messageIds, senderId }) => {
      try {
        // Emit an event back to the sender to notify them that the message has been viewed
        const senderSocket = userSockets[senderId];
        if (senderSocket) {
       
          // Check if messages exist
          if (messageIds.length > 0) {
            
            await Message.updateMany(
              {
                _id: { $in: messageIds }, 
                isViewed: false,
              },
              {
                $set: { isViewed: true },
              },
              { writeConcern: { j: true, wtimeout: 1000, w: "majority" } }
            );
          }

          senderSocket.emit("modifyMessageViewed", { messageIds });
        }
      } catch (error) {
        console.error("Error marking message as viewed:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
      // Clean up user socket associations upon disconnection
      Object.keys(userSockets).forEach((userId) => {
        if (userSockets[userId] === socket) {
          delete userSockets[userId];
          console.log(`Removed socket association for user ${userId}`);
        }
      });
    });
  });
});
