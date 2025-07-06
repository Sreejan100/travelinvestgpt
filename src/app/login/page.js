"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "./Login.css";
import {signIn, useSession} from "next-auth/react";





export default function Login() {


const router = useRouter();
const [form, setForm] = useState ({email:'', password:''});
const [error, setError] = useState('');
const { data: session, status } = useSession();


useEffect(() => {
  if (status === "authenticated") {
    router.push("/"); // or your home page
  }
}, [status]);


const handleChange = (e) => {
  setForm({...form,[e.target.name]: e.target.value});
};



const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  const res = await signIn('credentials', {
    redirect:true,
    email: form.email,
    password: form.password 
  });

  if (!res?.ok) {
    setError('Invalid email  and password');
  }
  else {
    router.push('/');
  }
};

 return (

    <div className="login-wrapper">
    <div className="login-content">
    <div className="login-left">
      <img src="/chatloginimg.jpg" alt="Login Visual" className="login-image" />
    </div>
    <div className="login-right">
      <h2>Login to your account</h2>
      <p>Don't have an account? <a href="/register">Create account</a></p>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" name='email' onChange={handleChange} />
        <input type="password" placeholder="Password" name='password' onChange={handleChange} />
        
  
        <button type="submit">Login to your  account</button>
  
        <div className="or-divider">or login with</div>
      </form>

      <div className="social-buttons">
          <button className="google" onClick={() => signIn('google')}>Google</button>
          <button className="apple" onClick={() => signIn('apple')}>Apple</button>
      </div>
    </div>
    </div>
  </div>



 );  
}