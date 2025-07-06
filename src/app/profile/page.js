"use client";
import {useState, useRef, useEffect} from "react";
import {useRouter} from "next/navigation";
import "./Profile.css";
import { signOut, useSession } from 'next-auth/react';
import { update } from "next-auth/react";



export default function Profile() {


    const {data: session, status, update} = useSession();
    const [dbImage, setDbImage] = useState(null);
    const router = useRouter();
   

    useEffect(() =>{

        const fetchDBImage = async() => {
            if (!session?.user?.email) return;
            try {
                const res = await fetch(`/api/get-user?email=${session.user.email}`);
                const data = await res.json();

                if (res.ok && data?.image) {
                setDbImage(data.image);
                }
            } catch (err) {
                console.error("Failed to fetch DB image:", err);
            }
        };
        fetchDBImage();

    },[session]);

    console.log("Image From DB in USeeffect: ", dbImage);
    const profileImage = dbImage || session?.user?.image || '/sampleperson.jpeg';

    const deleteAccount =async () => {
        const confirmed = confirm("Are you sure you want to delete your account? This cannot be undone !!!")

        if (!confirmed) {
            return;
        }

        if (!session || !session.user) {
             console.error("Session or user is null");
            return;
        }

        console.log(session.user.id);

        try {
            const res = await fetch("/api/delete-account", {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain", 
                },
                body: session.user.email,
            }
            );

           if (!res.ok) throw new Error("Account deletion failed");

            console.log("Account deleted successfully");
             signOut({callbackUrl: '/register'});

        }catch(error) { 
            console.log("Error deleting Account: ", error);
            alert("Something went wrong");
        }
    }


    const handleImageUpload = async (e) => {

        console.log("Inside handle image upload")
        const file  = e.target.files[0];
        console.log("Uploading file:", file);
        const formData = new FormData();
        formData.append("file",file);
        formData.append("upload_preset","my_unsigned_preset");


        try {
            const cloudinaryRes = await fetch (
                "https://api.cloudinary.com/v1_1/dnis1d96v/image/upload",
                {
                    method:"POST",
                    body: formData 
                }
            );

            if (!cloudinaryRes.ok) {
                console.error("Cloudinary upload failed:", cloudinaryRes.statusText);
                alert("Cloudinary upload failed");
                return;
            }
            
            const cloudinaryData = await cloudinaryRes.json();

            if (!cloudinaryData.secure_url) {
                console.error("Missing secure_url in Cloudinary response:", cloudinaryData);
                alert("Image upload failed: No URL returned");
                return;
             }

            const imageUrl = cloudinaryData.secure_url;
            console.log("Update Image URL in handleImageUpload: ", imageUrl);
            const res = await fetch("/api/update-profile-image", {
                method: "POST",
                headers: {"Content-Type": "application/json" },
                body: JSON.stringify({
                    image:imageUrl,
                    email: session?.user?.email
                }),
            });

            if (!res.ok) {

                alert("Failed to update image in DB");

            }

            location.reload();
        }catch(err){
            console.log("upload error: ", err);
            alert("Upload Fsiled");
        }
    };

    if (status === "loading") return <p>Loading...</p>;
    


    return (

        <div className="main-profile-wrapper">

            <div className="main-profile-handler">
            <div className="main-profile-left">
                
                <div className="profile-img-wrapper">
                    <img src={profileImage} alt="Profile"/>
                </div>
               <div className="profile-function-buttons">
                    <button className="delete-account-button" onClick={deleteAccount}> Delete Account</button>
                    <button className="log-off-button" onClick={() => signOut({callbackUrl: '/login'})}>Log Off</button>
                    <button className="upload-image-button" onClick={() => document.getElementById('new-image-input').click()}> Update Profile Image</button>
                    <input type="file" accept="image/*" id="new-image-input" onChange={handleImageUpload} style={{display: 'none'}} />
               </div>
            </div>

            <div className="main-profile-right">

                <div className="Profile-Name">
                    <h1 className="profilename-head">User Name:</h1>
                    <h2 className="profilename-details">{session.user.name}</h2>
                </div>
                <div className="Profile-Email">
                    <h1 className="profileemail-head">Email ID:</h1>
                    <h2 className="profileemail-details">{session.user.email}</h2>
                </div>
                

            </div>
            </div>
        
        
        </div>



    );
}