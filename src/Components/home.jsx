import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import addimg from "../Components/add.png";

function Home() {
  const { username } = useParams();
  const navigate = useNavigate(); // For redirecting to login page
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [allMessages, setAllMessages] = useState({});

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket("ws://192.168.56.1:3001");
    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
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

        if (!selectedUser || selectedUser !== chatUser) {
          setSelectedUser(chatUser);
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

    return () => {
      socketRef.current.close();
    };
  }, [username, users, selectedUser]);

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
    if (messageText.trim() && selectedUser) {
      const newMsg = {
        type: "message",
        payload: {
          sender: username,
          receiver: selectedUser,
          text: messageText,
        },
      };
      socketRef.current.send(JSON.stringify(newMsg));

      setAllMessages((prev) => {
        const existing = prev[selectedUser] || [];
        return {
          ...prev,
          [selectedUser]: [...existing, newMsg.payload],
        };
      });

      setMessageText("");
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
