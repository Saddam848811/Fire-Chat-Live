import React, { useState, useEffect } from 'react';
import UserList from './UserList';
import Chat from './chat';
import { auth } from './firebase';
import './App.css';
import Auth from './auth';

const App = () => {
  const [user, setUser] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [viewingChat, setViewingChat] = useState(false);  // New state to track whether we're viewing chat

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);  // Effect for handling user authentication state

  return (
    <div className="app-wrapper">
      {user ? (
        <div className="app-container">
          <div className="user-chat-container">
            {viewingChat ? (
              <div className="chat-container">
                <Chat setUser={setUser} chatPartner={chatPartner} setViewingChat={setViewingChat} />
              </div>
            ) : (
              <div className="user-list-container">
                <UserList setChatPartner={setChatPartner} setViewingChat={setViewingChat} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <Auth setUser={setUser} />
      )}
    </div>
  );
};

export default App;
