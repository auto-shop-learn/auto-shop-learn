import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDuT32ZoLsFf3-2S-eFFcGXz45LYKfnGHo",
    authDomain: "autoshoplearn.firebaseapp.com",
    projectId: "autoshoplearn",
    storageBucket: "autoshoplearn.firebasestorage.app",
    messagingSenderId: "705979825849",
    appId: "1:705979825849:web:e0e2892b923b6c58cfa568",
    measurementId: "G-G4499JZQ1J"
  };

// Initialize Firebase
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (e) {
    if (e.code === 'app/duplicate-app') {
        app = getApp();
    } else {
        console.error("Firebase initialization error:", e);
        // Handle error appropriately, maybe throw it again or show a user-friendly message
    }
}

// Export Firestore and Storage
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
