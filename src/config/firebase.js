import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBA4vuM9FF4hFoB6jn1yEjxZ8lj5KDg2tc",
  authDomain: "smart-autoshop.firebaseapp.com",
  projectId: "smart-autoshop",
  storageBucket: "smart-autoshop.appspot.com",
  messagingSenderId: "42197520080",
  appId: "1:42197520080:web:71df2423da5bf4fc9798d5"
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
