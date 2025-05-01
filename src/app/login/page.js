"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "./Login.css";


export default function Login() {

const [Email, setEmail] = useState("");
const [password, setPassword] = useState("");
const router = useRouter();

const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
        email: Email,
        password: password
    }
    console.log(formData);
    const response = await fetch("http://127.0.0.1:5000/receive_login_creds", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (data.message === "Login successful") {
      localStorage.setItem("isLoggedIn", "true");
      router.push("/");
    } else {
      alert(data.message);
      router.push("/login");
    }
}

 return (

    <div className="login-wrapper">
    <div className="login-content">
    <div className="login-left">
      <img src="/chatloginimg.jpg" alt="Login Visual" className="login-image" />
    </div>
    <div className="login-right">
      <h2>Login to your account</h2>
      <p>Don't have an account? <a href="#">Create account</a></p>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={Email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        
  
        <button type="submit">Login to your  account</button>
  
        <div className="or-divider">or login with</div>
  
        <div className="social-buttons">
          <button className="google">Google</button>
          <button className="apple">Apple</button>
        </div>
      </form>
    </div>
    </div>
  </div>



 );  
}