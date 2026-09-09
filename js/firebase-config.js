import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// TODO: Replace this with your actual Firebase configuration
// 1. Go to Firebase Console (console.firebase.google.com)
// 2. Create a new project and add a Web App
// 3. Copy the configuration object and replace the below object
const firebaseConfig = {
  apiKey: "AIzaSyAQrPw6Yfe_48CTP4YIcBygDtolxCIR7Xk",
  authDomain: "portfolio-jaky.firebaseapp.com",
  projectId: "portfolio-jaky",
  storageBucket: "portfolio-jaky.firebasestorage.app",
  messagingSenderId: "48047414147",
  appId: "1:48047414147:web:541523f8b2af69bed674b6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
