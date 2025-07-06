"use client";
import {useState, useRef, useEffect} from "react";
import {useRouter} from "next/navigation";
import "./Register.css";
import { signIn, useSession } from 'next-auth/react';


export default function Register() {


    const router = useRouter();

   const { data: session, status } = useSession();

   useEffect(() => {
  if (status === "authenticated") {
    router.push("/"); // or your home page
  }
}, [status]);




    const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });



  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Failed to register');
      return;
    }

    // Auto login after successful registration
    await signIn('credentials', {
      email: form.email,
      password: form.password,
      callbackUrl: '/', // Redirect to home
    });
  };

    


  return (
    <div className="registration-wrapper">
    <div className="registration-content">
    <div className="registration-left">
        <img src="/chatloginimg.jpg" alt="registration Visual" className="registration-image"/>
    </div>
    <div className="registration-right">
        <h2>Create your Account</h2>
        <p> Have an account ? <a href="/login">Login to your account</a></p>
        <form  onSubmit = {handleSubmit}>
            <input type="text" placeholder="Full Name" name="name" onChange={handleChange} />
            <input type="email" placeholder="Email" name="email" onChange={handleChange} />
            <input type="password" placeholder="Password" name="password" onChange={handleChange} />
            <button type="submit"> Create your Account</button>

            <div className="or-divider">or register with</div>
        </form>

        <div className="registration-social-button">
            <button className="register-google" onClick={() => signIn('google')}>Google</button>
            <button className="register-apple" onClick={() => signIn('apple')}>Apple</button>
        </div>
    </div>
    </div>     
    </div>

  );

}

