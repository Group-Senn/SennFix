// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCodap85dPOcb11GdeTElaNMNUqgDF7nfA",
  authDomain: "senn-fix-auth.firebaseapp.com",
  projectId: "senn-fix-auth",
  storageBucket: "senn-fix-auth.firebasestorage.app",
  messagingSenderId: "252856408147",
  appId: "1:252856408147:web:b25db7a6fff382e0138ea6",
  measurementId: "G-FMXXF63JYY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);

export { app, analytics, auth };
