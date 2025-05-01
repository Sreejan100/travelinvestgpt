"use client";
import {useState, useRef, useEffect} from "react";
import {useRouter} from "next/navigation";
import "./Register.css";


export default function Register() {

    const [Email, setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [Name, setName] = useState("");
    const [imageurl,setImageUrl] = useState("");
    const router = useRouter();

    const handleSubmit = async(e) => {
        e.preventDefault();

        const formData = {
            name: Name,
            imageurl:imageurl,
            email:Email,
            password: password
        }
        const response = await fetch("http://127.0.0.1:5000/receive_registration_creds", {
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
    <div className="registration-wrapper">
    <div className="registration-content">
    <div className="registration-left">
        <img src="/chatloginimg.jpg" alt="registration Visual" className="registration-image"/>
    </div>
    <div className="registration-right">
        <h2>Create your Account</h2>
        <p> Have an account ? <a href="#">Login to your account</a></p>
        <form  onSubmit = {handleSubmit}>
            <input type="text" placeholder="Full Name" value={Name} onChange={e => setName(e.target.value)} />
            <input type="text" placeholder="Image URL" value={imageurl} onChange={e => setImageUrl(e.target.value)} />
            <input type="email" placeholder="Email" value={Email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit"> Create your Account</button>

            <div className="or-divider">or register with</div>

            <div className="registration-social-button">
            <button className="register-google">Google</button>
            <button className="register-apple">Apple</button>
            </div>
        </form>
    </div>
    </div>     
    </div>

  );

}

