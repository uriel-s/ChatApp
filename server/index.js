require('dotenv').config();
const express = require('express');
const cors = require("cors");
const socketIo = require('socket.io');
const app = express();
const bcrypt = require("bcrypt");
const http = require('http');

const dbConnect = require("./dbConnect");
const User = require("./model/userModel");
const Message = require("./model/messageModel");


app.use(cors({
  origin: '*'
}));
app.use(express.json());
// execute database connection 
dbConnect();

const userSockets = {};
const port = process.env.PORT; 

app.use(cors({
  origin: '*'
}));



app.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, 10)
  .then((hashedPassword) => {
    const user = new User({
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword
        });
        
        user.save({
          writeConcern: {
            j: true,
            wtimeout: 1000
          }
        })
        .then(e => {
          res.status(201).json({ id: user.id , name: user.name });
        })
        .catch((error) => {
          res.status(500).send({
            message: "Error creating user",
            error,
          });
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
      .then(users => {
          res.status(200).json(users);
        })
        .catch(error => {
          res.status(500).json({ message: "Error fetching users", error: error });
        });
      });

      app.post("/getMessage", (req, res) => {
        const { recipientId,senderId } = req.body;

        Message.find({
          $or: [
            { $and: [{ senderId: recipientId }, { recipientId: senderId }] }, // both sides of messages
            { $and: [{ senderId: senderId }, { recipientId: recipientId }] }
          ]
        })
        .then(messages => {
            res.status(200).json(messages);
          })
          .catch(error => {
            res.status(500).json({ message: "Error fetching users", error: error });
          });
        });


app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  //from db.collection.findOne()
  User.findOne({ email })
  .then(user => {
    if (!user) {
      console.log('no user');
      return false;
    }
    bcrypt.compare(password, user.password)
    .then(match => {
      if (match) {
        res.status(200).json({ id: user.id , name: user.name });
      } else {
        res.status(401).json({ message: "Incorrect password" });
      }
    })
    .catch(error => {
      console.log('password wrong');
      return false;
    });
  })
    .catch(error => {
      console.log('no email wrong');
      return false;
    });
  });
  
  // Get a single user by ID
  app.get("/users/:id", (req, res) => {
    const userId = req.params.id;
    User.findById(userId)
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching user", error: error });
    });
  });
  
  // Delete a user by ID
  app.delete("/delete/:id", (req, res) => {
    const userId = req.params.id;
  User.findByIdAndDelete(userId ,{
    writeConcern: {
      j: true,
      wtimeout: 1000
    }
  })
  .then(user => {
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully", user: user });
      })
      .catch(error => {
          res.status(500).json({ message: "Error deleting user", error: error });
      });
    });
    
const server = http.Server(app);
    
server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  const io = socketIo(server, {
    cors: {
      origin: '*',
    }
  });

  io.on('connection', (socket) => {
    console.log('New user connected');
  
     // Handle user authentication
  socket.on('authenticate', userId => {
    console.log(`User ${userId} authenticated`);
    userSockets[userId] = socket; // Store the user's socket
  });
  
  socket.on('sendMessage', ({ text, senderId, recipientId }) => {
    console.log(`Received message for user ${recipientId}:`, text);
    const recipientSocket = userSockets[recipientId];
    const senderSocket = userSockets[senderId];
    

    // user a send message to user b ----> both online
    // store message in mongo { messageId, senderId, recipentId, text, viewed: false }
    new Message({
      senderId,
      text,
      recipientId
    }).save({
      writeConcern: {
        j: true,
        wtimeout: 1000
      }
    }).then((messageObject) => {
      console.log(messageObject);
      senderSocket.emit('message', { text, username: senderId, id: messageObject.id, isViewed: messageObject.isViewed }); // Send the message to the sender
      if (recipientSocket) {
        recipientSocket.emit('message', { text, username: senderId, id: messageObject.id, isViewed: messageObject.isViewed }); // Send the message to the recipient
      } else {
        console.log(`User ${recipientId} not found or not connected`);
      }
    });
  });

  // socket.on('onMessageView', ({ messageId, recipientId }) => {
  //   const recipientSocket = userSockets[recipientId];

  //   if (recipientSocket) {
  //     recipientSocket.emit('notifyOnMessageView', { messageId }); // Send the message to the recipient
  //   } else {
  //     console.log(`User ${recipientId} not found or not connected`);
  //   }
  // });

  

    // socket.on('sendMessage', (message) => {
    //   console.log('messege');
    //     io.emit('message', message); // Broadcast the message to all connected clients
    // });
  
    socket.on('disconnect', () => {
      console.log('Client disconnected');
      // Clean up user socket associations upon disconnection
      Object.keys(userSockets).forEach(userId => {
        if (userSockets[userId] === socket) {
          delete userSockets[userId];
          console.log(`Removed socket association for user ${userId}`);
        }
      });
    });
  
});

});

