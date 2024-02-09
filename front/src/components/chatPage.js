import React, { useState , useEffect, useMemo} from "react";
import { useLocation ,useNavigate} from "react-router-dom";
import Axios from "axios";
import io from 'socket.io-client';
import Message from './message';
const socket = io('http://localhost:3000');

function ChatPage() {
    const location = useLocation();
    const navigate = useNavigate();
    

    const [id, setId] = useState(location.state.id);
    const [name, setName] = useState(location.state.name); 
    const [recipient, setRecipient] = useState('');
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');

    useEffect(() => {
        // Fetch all users from backend when component mounts
        Axios.get('http://localhost:3000/getAllUsers')
          .then(response => {
            setUsers(response.data); // Update users state with data from backend
        
          })
          .catch(error => {
            console.error('Error fetching users:', error);
          });
      }, []);

      const userList = useMemo(() => {
        return users.map(item => {
            return <li><button 
            onClick={() => {
                setRecipient(item['_id']);
                fetchMessages(item['_id']);
            }}
            >{item['name']}</button></li>;
          });
    }, [users]);

    const onButtonClickDeleteUser = () => {
        Axios.delete(`http://localhost:3000/delete/${id}`)
         .then(response => {
          let path = '/'; 
          navigate(path);
        })
        .catch(error => {
         alert('user not delete')
        });
      }


      const fetchMessages = (recipentId) => {
        Axios({
            method: 'post',
            url: "http://localhost:3000/getMessage",
          data: {
            senderId: id,
            recipientId: recipentId
          }
        }) 
        .then(response => {
            setMessages([...response.data]);      
        })
        .catch(error => {
          console.error('Error fetching messages:', error);
        });
      };


      useEffect(() => {
        // Authenticate user upon component mount
        socket.emit('authenticate', id); // Replace `userId` with the actual user ID
      }, []);
      useEffect(() => {
        // TODO: test if we can delete messeges dependecy
        socket.on('message', (message) => {
        //   const { senderId, messageId } = message;
        //   socket.emit('onMessageView', { senderId, messageId });
            // emit view message

            console.log(message)
          setMessages([...messages, message]);
        });
      }, [messages]);
    
      const sendMessage = () => {
        socket.emit('sendMessage', { text: messageText, senderId: id, recipientId: recipient });
        setMessageText('');
      };

    return (
      <div>
         <div>
            <h1>Welcome to the chat page, {name}!</h1>
            <p>Your user ID is: {id}</p>
            <p>Your user Name is: {location.state.name}</p>
            <p>current recipientId is: {recipient}</p>
      </div>
        <div className={"inputContainer"}>
        <input
            className={"inputButton"}
            type="button"
            onClick={onButtonClickDeleteUser}
            value={"Delete Your User"} />
        </div>
        <br></br>
        <div>
          {userList}
         <div className="App">
      <h1>Real-Time Chat App</h1>
      <div className="messages">
        {messages.map((message, index) => (
          <Message key={index} username={message.senderId} text={message.text} />
        ))}
      </div>
      <div className="input-box">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>






        </div>



















    </div>
    );

}


export default ChatPage