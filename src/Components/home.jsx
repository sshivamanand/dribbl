import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import addimg from "./add.png";

// write your IP here
const YOUR_IP = "";

function Home() {
  const { username } = useParams();
  const navigate = useNavigate(); 
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [allMessages, setAllMessages] = useState({});

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket(`wss://${YOUR_IP}:3001`);
    
    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
      // Send login message to register user
      socketRef.current.send(JSON.stringify({
        type: "login",
        payload: { username }
      }));
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received from server:", data);

      if (data.type === "message") {
        const { sender, receiver } = data.payload;
        const chatUser = sender === username ? receiver : sender;

        if (!users.includes(chatUser)) {
          setUsers((prev) => [...prev, chatUser]);
        }

        setAllMessages((prev) => {
          const existing = prev[chatUser] || [];
          return {
            ...prev,
            [chatUser]: [...existing, data.payload],
          };
        });
      }
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    /* Graceful Termination */
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [username]);

  const AddUser = () => {
    const user = prompt("Enter the username of the user you want to add:");
    if (user && user !== username && !users.includes(user)) {
      setUsers((prev) => [...prev, user]);
    }
  };

  const OpenUserChats = (user) => {
    setSelectedUser(user);
  };

  const sendMessage = () => {
    if (messageText.trim() && selectedUser && socketRef.current) {
      const newMsg = {
        type: "message",
        payload: {
          sender: username,
          receiver: selectedUser,
          text: messageText,
          timestamp: new Date().toISOString(),
        },
      };
      
      socketRef.current.send(JSON.stringify(newMsg));
      setMessageText("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleLogout = () => {
    if (socketRef.current) {
      socketRef.current.close();
      console.log("WebSocket closed on logout");
    }

    setUsers([]);
    setSelectedUser(null);
    setAllMessages({});

    navigate("/");
  };

  return (
    <div className="display">
      <div className="contacts">
        <div className="users">
          <div className="header">
            <img src={addimg} alt="adduser" className="add-user-img" />
            <button className="add-user" onClick={AddUser}>
              + Add User
            </button>
          </div>
          {users.map((user, index) => (
            <div key={index} className="user">
              <div className="user-img-num"></div>
              <button className="user-name" onClick={() => OpenUserChats(user)}>
                {user}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="chats">
        <div className="user-detail">
          <div className="user-img-logged-in"></div>
          <p className="logged_in_user">{username}</p>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="messages">
          {(allMessages[selectedUser] || [])
            .filter(
              (msg) =>
                (msg.sender === username && msg.receiver === selectedUser) ||
                (msg.sender === selectedUser && msg.receiver === username)
            )
            .map((msg, index) => (
              <div
                key={index}
                className="message"
                style={{ color: "#000", width: "80vw" }}>
                <strong style={{ color: "black" }}>
                  {msg.sender === username ? "You" : msg.sender}:
                </strong>{" "}
                {msg.text}
              </div>
            ))}
        </div>

        {selectedUser && (
          <div className="message-input">
            <input
              style={{ paddingLeft: "10px", marginRight: "10px", width: "95%" }}
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${selectedUser}`}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
