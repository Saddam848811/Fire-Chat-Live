import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'react-lottie';  // Import Lottie for the animation
import { db, auth } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, limit, deleteDoc, doc, getDocs } from 'firebase/firestore';
import './chat.css';
import { format } from 'date-fns';
import animationData from '/public/videos/bird.json'; // Ensure the correct path


// Import Lottie animation JSON
import sendButtonAnimation from '/public/videos/bird.json';  // Make sure this path is correct

const getChatId = (user1Uid, user2Uid) => {
  return user1Uid < user2Uid ? `${user1Uid}_${user2Uid}` : `${user2Uid}_${user1Uid}`;
};

const Chat = ({ setUser, chatPartner, setViewingChat }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const chatContainerRef = useRef(null);
  const [currentChat, setCurrentChat] = useState(null);  // To track the active chat

  const messageSentSound = new Audio('/public/assets/send.mp3');
  const messageReceivedSound = new Audio('/public/assets/rec.mp3');

  messageSentSound.preload = 'auto';
  messageReceivedSound.preload = 'auto';

  const sendMessage = async () => {
    if (message.trim()) {
      const user = auth.currentUser;
      const chatId = getChatId(user.uid, chatPartner.id);

      try {
        messageSentSound.play().catch((error) => console.error("Error playing message sent sound:", error));
      } catch (error) {
        console.error("Error playing sound:", error);
      }

      await addDoc(collection(db, 'privateChats', chatId, 'messages'), {
        text: message,
        uid: user.uid,
        name: user.displayName,
        photoURL: user.photoURL || '/default-avatar.png',
        timestamp: new Date(),
      });

      setMessage('');
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatPartner) return;

      const user = auth.currentUser;
      const chatId = getChatId(user.uid, chatPartner.id);
      setCurrentChat(chatId); // Set the current chat ID when fetching messages
      const messagesRef = collection(db, 'privateChats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(20));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesList = [];
        querySnapshot.forEach((doc) => {
          messagesList.push(doc.data());
        });
        setMessages(messagesList);
        setIsLoading(false);
      });

      return () => unsubscribe();
    };

    fetchMessages();
  }, [chatPartner]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    };

    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleNewMessages = (newMessages) => {
      const newMessage = newMessages[newMessages.length - 1];
      const chatId = getChatId(auth.currentUser?.uid, chatPartner.id);

      if (newMessage && newMessage.uid !== auth.currentUser?.uid) {
        // Only show the notification if the current chat is not open
        if (chatId !== currentChat) {
          // Check if browser supports notifications and if the user has granted permission
          if (Notification.permission === "granted") {
            new Notification(`${newMessage.name || 'Anonymous'} sent a message`, {
              body: newMessage.text, // Display the message text in the notification
              icon: newMessage.photoURL || '/default-avatar.png',
            });
          }
        }
        try {
          messageReceivedSound.play();
        } catch (error) {
          console.error("Error playing sound:", error);
        }
      }
    };

    handleNewMessages(messages);
  }, [messages, currentChat, chatPartner]);

  const clearChats = async () => {
    const user = auth.currentUser;
    const chatId = getChatId(user.uid, chatPartner.id);
    const messagesRef = collection(db, 'privateChats', chatId, 'messages');
  
    const deleteSound = new Audio('/public/assets/delete.mp3');
  
    try {
      deleteSound.play().catch((error) => console.error("Error playing delete sound:", error));

      const querySnapshot = await getDocs(messagesRef);
      querySnapshot.forEach(async (doc) => {
        const messageData = doc.data();
        if (messageData.uid === user.uid) {
          await deleteDoc(doc.ref);
        }
      });

      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error clearing chats:", error);
    }
  };

  // Lottie animation options for the Send button
  const defaultOptions = {
    loop: false, // The animation will not loop
    autoplay: true, // It will play automatically
    animationData: sendButtonAnimation, // Using the imported Lottie JSON
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <div className="chat-header">
          {/* Back Arrow Button */}
          <button className="back-arrow" onClick={() => setViewingChat(false)}>
            &larr;
          </button>

          <h2>Chat with {chatPartner.name}</h2>

          {/* Burger Menu Icon */}
          <div className="burger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className="burger-line"></div>
            <div className="burger-line"></div>
            <div className="burger-line"></div>
          </div>

          {/* Menu Dropdown */}
          {isMenuOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={clearChats}>Clear Chats</button>
            </div>
          )}
        </div>

        <div ref={chatContainerRef} className="messages-section">
          {messages
            .slice()
            .reverse()
            .map((msg, index) => (
              <div key={index} className={`message ${msg.uid === auth.currentUser.uid ? 'current-user' : ''}`}>
                <div className={`message-content ${msg.uid === auth.currentUser.uid ? 'current-user' : ''}`}>
                  <img
                    src={msg.photoURL || '/default-avatar.png'}
                    alt="User Avatar"
                    className={`user-avatar ${msg.uid === auth.currentUser.uid ? 'current-user-avatar' : ''}`}
                  />
                  <div className="message-bubble">
                    <div className="message-name">{msg.name || 'Anonymous'}:</div>
                    <p className="message-text">{msg.text}</p>
                    <div className="message-time">{format(msg.timestamp.toDate(), 'hh:mm a')}</div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            className="input-field"
          />
          
          {/* Send Button with Lottie Animation */}
          <button onClick={sendMessage} className="button">
  <Lottie
    options={{
      animationData: animationData, // Your Lottie JSON data
      autoplay: true, // Ensures the animation starts automatically
      loop: true, // Ensures the animation loops
    }}
    height={50}
    width={50}
    style={{
      transform: 'scale(3)', // Make it larger
      transformOrigin: 'center',
      maxWidth: '100%',
      maxHeight: '100%',
    }}
  />
</button>



        </div>
      </div>
    </div>
  );
};

export default Chat;
