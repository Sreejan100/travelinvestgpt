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
    alert(data.message);
    if (response.ok) {
        localStorage.setItem("isLoggedIn", "true");
        router.push("/");
    }
}

 return (

            <div className="login-container">
                <div className="image-container">
                    <img src="/chatloginimg.jpeg" className="login-image" />
                </div>
                <div className="login-form-container">
                    <h1 className="login-title">Login</h1>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <input type="email" placeholder="Email" className="login-input-user"  value={Email} onChange={(e) => setEmail(e.target.value)}/>
                        <input type="password" placeholder="Password" className="login-input-pass" value={password} onChange={(e) => setPassword(e.target.value)}/>
                        <button type="submit" className="login-button-submit">Login</button>
                    </form>
                </div>
                
            </div>



 );  
}