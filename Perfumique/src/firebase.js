// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsjAe0ffbVIu8CiUgwxETm1KkovF87alI",
  authDomain: "reactfinalproject-baf53.firebaseapp.com",
  projectId: "reactfinalproject-baf53",
  storageBucket: "reactfinalproject-baf53.firebasestorage.app",
  messagingSenderId: "481468138929",
  appId: "1:481468138929:web:ddfad4b53637deed9ea990",
  measurementId: "G-E0Y30CS5BK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db };