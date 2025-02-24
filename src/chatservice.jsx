// src/chatService.js
import { collection, addDoc, doc, getDoc, setDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from './firebase';

// Generate a unique chatId for two users
export const getChatId = (userId1, userId2) => {
  const ids = [userId1, userId2].sort();
  return `${ids[0]}_${ids[1]}`;
};

// Send message to a private chat
export const sendMessage = async (recipientId, message) => {
  const currentUserId = auth.currentUser.uid;

  // Generate unique chatId
  const chatId = getChatId(currentUserId, recipientId);

  // Reference to the chat document
  const chatDocRef = doc(db, 'chats', chatId);

  // Check if chat exists, if not create it
  const chatDoc = await getDoc(chatDocRef);
  if (!chatDoc.exists()) {
    await setDoc(chatDocRef, {
      users: [currentUserId, recipientId],
    });
  }

  // Add the message to the messages subcollection
  const messagesRef = collection(chatDocRef, 'messages');
  await addDoc(messagesRef, {
    senderId: currentUserId,
    text: message,
    timestamp: new Date(),
  });
};

// Listen for messages in a specific chat
export const listenForMessages = (chatId, setMessages) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messagesList = [];
    querySnapshot.forEach((doc) => {
      messagesList.push(doc.data());
    });
    setMessages(messagesList);
  });

  return unsubscribe;
};
