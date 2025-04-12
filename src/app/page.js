"use client";
import { useState, useEffect, useRef } from "react";
import "./FrontLayout.css";

export default function Home() {
  const apiUrl = 'http://127.0.0.1:5000/receive_user_input';
  const [text, setText] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState([]);  // Store all messages
  const chatRef = useRef(null);
  
  const handleChange = (event) => {
    setText(event.target.value);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]); // Scroll when new message is added

  async function sendAndReceiveDataFromModel(textData) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'text': textData })
      });

      const data = await res.json();
       
      setTimeout(() => {
      setMessages(prevMessages => [
          ...prevMessages,
          { text: data.message, sender: "model" }
        ]);
      }, 1500); 
    } catch (error) {
      console.log('Error sending data:', error);
    }
  }

  const handleClick = () => {
    if (text.trim() === "") return;  // Prevent empty messages

    
      setMessages(prevMessages => [
        ...prevMessages,
        { text: text, sender: "user" }
      ]);

      sendAndReceiveDataFromModel(text);
      setText('');
    // 3-second delay
  };

  const handleRefresh = () => {
    setMessages([]);
    setText('');      // Clear input field
  }

  return (
    <div>

        <button onClick={handleRefresh}  className="Refresh-Button"><img src='/refresh-img.png' className="refrsh-img"/></button>
        <div className="chat-container" >
          <div className="chat-messages" ref={chatRef} >
            {messages.map((msg, index) => (
              <div key={index} className={msg.sender === "user" ? "Sent-Message" : "Received-Message"}>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Type your text here..."
              value={text}
              onChange={handleChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleClick();
              }}
            />
            <button className="send-button" onClick={handleClick}>➤</button>
          </div>
        </div>
    </div>
  );
}
 