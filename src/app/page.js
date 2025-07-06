"use client";
import { useState, useEffect, useRef } from "react";
import "./FrontLayout.css";
import { useRouter } from "next/navigation";
import {useSession} from "next-auth/react";

export default  function Home() {
  const apiUrl = 'http://127.0.0.1:5000/receive_user_input';
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);  // Store all messages
  const chatRef = useRef(null);
  const router = useRouter();
  const {data: session, status} = useSession();
  console.log('Session:', session);
 console.log('Status:', status);

  useEffect(() => {
  if (status !== "authenticated") {
    router.push("/login"); // or your home page
  }
}, [status]);

  useEffect(() => {
    if (session && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [session, messages]);

  

  const handleChange = (event) => {
    setText(event.target.value);
  };


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

  const handleprofileClick = () => {
    router.push('/profile');
  }

  return (
    <div>
        <button  onClick = {handleprofileClick} className="profile-page-button"><img src = '/ProfilePageIMG.jpg' className="profile-page-img"/></button>
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
 