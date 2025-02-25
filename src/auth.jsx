import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { setDoc, doc, addDoc, collection } from 'firebase/firestore';
import Lottie from 'react-lottie';
import './auth.css';

// Import your Lottie animation here
import fireAnimationData from '/public/videos/fire.json'; // Assuming your Lottie JSON file is named fireAnimation.json

const Auth = ({ setUser }) => {
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]); // Store the list of users

  // Define the page load sound here
  const pageLoadSound = new Audio('/assets/fire.mp3');  // Assuming sound is in the public/sounds folder

  // This function will be called after user clicks anything to start the sound
  const playSound = () => {
    pageLoadSound.play().catch((error) => {
      console.error("Error playing page load sound:", error);
    });
  };

  // Function to handle Google sign-in
  const handleGoogleSignIn = async () => {
    playSound(); // Play the sound when the user interacts with the button

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL || 'default-avatar.png',
        createdAt: new Date(),
      });

      // Send a message saying the user is online
      await addDoc(collection(db, 'messages'), {
        text: `${user.displayName} is now online.`,
        uid: user.uid,
        name: user.displayName,
        photoURL: user.photoURL || '/default-avatar.png',
        timestamp: new Date(),
      });

      setUser(user);
    } catch (error) {
      setError(error.message);
      console.error("Error signing in with Google: ", error.message);
    }
  };

  // Lottie options with the imported animation
  const fireAnimationOptions = {
    loop: true,
    autoplay: true,
    animationData: fireAnimationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  // Fetch users to display in the user list (Simulating user data here)
  useEffect(() => {
    // Simulate fetching users (replace with actual Firestore fetching)
    const sampleUsers = [
      { id: '1', name: 'User 1' },
      { id: '2', name: 'User 2' },
      { id: '3', name: 'User 3' },
      { id: '4', name: 'User 4' },
      { id: '5', name: 'User 5' },
    ];
    setUsers(sampleUsers);

    // Ensure the chat container height is recalculated on mount
    window.dispatchEvent(new Event("resize"));
  }, []);

  return (
    <div className="auth-container" onClick={playSound}>
      {/* Video background */}
      <video className="background-video" autoPlay loop muted>
        <source src="assets/resident.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Sign In Form */}
      <div className="auth-form">
        <h1>Welcome, to Fire_Chat</h1>
        <div className="lottie-container">
          <Lottie options={fireAnimationOptions} height={100} width={100} />
        </div>
        {error && <p className="error">{error}</p>}
        <p>"The Easiest Platform to Connect and Chat Just Using Your 'Google' ID !"</p>
        <button className="auth-button" onClick={handleGoogleSignIn}>Sign in with Google</button>

        {/* User List */}
        <div className="user-list-container">
          {users.map((user) => (
            <div key={user.id} className="user-item">
              <p>{user.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Auth;
