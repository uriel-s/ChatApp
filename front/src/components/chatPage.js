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


    const messageList = useMemo(() => {
        return messages.map((message, index) => (
            <Message key={message.id} senderName={message.senderName} name={name} text={message.text} isViewed={message.isViewed}/>
          ));
    }, [messages]);

    const onButtonClicklogOut = () => {
        Axios.post(`http://localhost:3000/logout`)
          .then(response => {
            let path = '/'; // Redirect to login page
            navigate(path);
          })
          .catch(error => {
            console.error(error);
            alert('Error logging out');
          });
      };


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
           const msgs = (response.data || []);
           setMessages([...msgs]);  
        })
        .catch(error => {
          console.error('Error fetching messages:', error);
        });
      };


      useEffect(() => {
        // first connect the user to the back
        socket.emit('authenticate', id); 
      }, []);


      useEffect(() => {
        const newViewedMessageIds = [];
        messages.forEach(message => {
            if(!message.isViewed && message.senderId != id && message.senderId === recipient){
                newViewedMessageIds.push(message._id);
            }
        });

        if(newViewedMessageIds.length > 0){
            socket.emit('messageViewed', { messageIds: newViewedMessageIds, senderId: recipient });
        }

      }, [messages]);

      useEffect(() => {
        socket.on('message', (message) => {
            setMessages((prevMessageState) => {
                const found = prevMessageState.find((msg) => msg._id === message._id);

                if(( message.senderId === recipient || message.senderId === id) && !found){
                    return [...prevMessageState, message];
                }
                return prevMessageState;
            })
        }); 

        return () => socket.off('message');
      }, []);
    
      const sendMessage = () => {
        socket.emit('sendMessage', { text: messageText, senderName: name ,senderId: id, recipientId: recipient });
        setMessageText('');
      };

    const handleModifyMessageViewed = ({ messageIds }) => {
        setMessages((prevMessageState) => {
            return prevMessageState.map((msg) =>
            messageIds.includes(msg._id) ? { ...msg, isViewed: true } : msg)
        })
    };

      useEffect(() => {
        socket.on('modifyMessageViewed', handleModifyMessageViewed);

        return () => socket.off('modifyMessageViewed');
      }, []); 




    return (
      <div>
         <div>
            <h1>Welcome to the chat page, {name}!</h1>
            <p>Your user ID is: {id}</p>
            <p>Your user Name is: {location.state.name}</p>
            <p>current recipientId is: {recipient}</p>
      </div>
      <br></br>
      <div className={"inputContainer"}>
        <input
            className={"inputButton"}
            type="button"
            onClick={onButtonClicklogOut}
            value={"Log Out"} />
        </div>
        <br></br>
        <div className={"inputContainer"}>
        <input
            className={"inputButton"}
            type="button"
            onClick={onButtonClickDeleteUser}
            value={"Delete Your User"} />
        </div>
        <br/>
        <div>
          {userList}
         <div className="App">
      <h1>Real-Time Chat App</h1>
      <div className="messages">
        {messageList}
      </div>
      <div className="input-box">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
        />
        <button disabled={!recipient}  onClick={sendMessage}>Send</button>
      </div>
    </div>




        </div>


    </div>
    );

}


export default ChatPage