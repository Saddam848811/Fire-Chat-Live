import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDjYh7nVeJwNY9j2SWOlVkGIivQidXuMc8",
  authDomain: "firechat-1e2a7.firebaseapp.com",
  databaseURL: "https://firechat-1e2a7-default-rtdb.firebaseio.com",
  projectId: "firechat-1e2a7",
  storageBucket: "firechat-1e2a7.firebasestorage.app",
  messagingSenderId: "953339345701",
  appId: "1:953339345701:web:eebb578d49d73da8fff8cc",
  measurementId: "G-1405Y4KCGY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
