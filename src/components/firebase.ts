// firebase.ts
// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDW5ZI06XcTE9AwhEa1vaqCyN6o4VKXXxU",
  authDomain: "authentication-8af3b.firebaseapp.com",
  projectId: "authentication-8af3b",
  storageBucket: "authentication-8af3b",
  messagingSenderId: "669984513257",
  appId: "1:669984513257:web:277439a01610dc92152478"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { auth, db };
