import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCaBbzEZ9Y9OeX7d4xmKZ8pos_a1uJwXjQ",
    authDomain: "autoshop-11f7b.firebaseapp.com",
    projectId: "autoshop-11f7b",
    storageBucket: "autoshop-11f7b.firebasestorage.app",
    messagingSenderId: "864037068512",
    appId: "1:864037068512:web:b0f1460ba456c660567a85",
    measurementId: "G-9Q9EV58LXJ"
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
