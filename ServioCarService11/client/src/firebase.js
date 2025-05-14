import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA0rXvDUFooflycankn6YWxPkjSGOAP7O0",
  authDomain: "servioweb-acbb1.firebaseapp.com",
  projectId: "servioweb-acbb1",
  storageBucket: "servioweb-acbb1.firebasestorage.app",
  messagingSenderId: "591228223876",
  appId: "1:591228223876:web:1f9b359f29407acf6addd1",
  measurementId: "G-HZT907GHZS"



};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);