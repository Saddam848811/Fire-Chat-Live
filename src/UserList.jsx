import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';  
import { collection, getDocs } from 'firebase/firestore';
import './UserList.css';

const UserList = ({ setChatPartner, setViewingChat }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          usersList.push({ id: doc.id, name: data.name, photoURL: data.photoURL, email: data.email });
        });
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    };

    fetchUsers();
  }, []);

  const handleSelectUser = (user) => {
    setChatPartner(user);
    setViewingChat(true); // Switch to the chat view
  };

  const currentUser = auth.currentUser;

  // Filter users based on the search query
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="user-list-box">
      {/* Search bar */}
      <input
        type="text"
        className="search-bar"
        placeholder="Search by Gmail ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {filteredUsers.map((user) => {
        if (user.id === currentUser.uid) {
          return (
            <div key={user.id} onClick={() => handleSelectUser(user)} className="user-item">
              <img src={user.photoURL || '/default-avatar.png'} alt={user.name} className="user-avatar" />
              <span>{user.name} (It's you)</span>
            </div>
          );
        }

        return (
          <div key={user.id} onClick={() => handleSelectUser(user)} className="user-item">
            <img src={user.photoURL || '/default-avatar.png'} alt={user.name} className="user-avatar" />
            <span>{user.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export default UserList;
