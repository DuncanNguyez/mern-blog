// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-d7aaf.firebaseapp.com",
  projectId: "mern-blog-d7aaf",
  storageBucket: "mern-blog-d7aaf.appspot.com",
  messagingSenderId: "537439256690",
  appId: "1:537439256690:web:3dc1a930ed09ad9acc82eb",
  measurementId: "G-QZK42DHXKN"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);