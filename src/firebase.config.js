import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence,
  browserSessionPersistence 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBA4vuM9FF4hFoB6jn1yEjxZ8lj5KDg2tc",
  authDomain: "smart-autoshop.firebaseapp.com",
  projectId: "smart-autoshop",
  storageBucket: "smart-autoshop.appspot.com",
  messagingSenderId: "42197520080",
  appId: "1:42197520080:web:71df2423da5bf4fc9798d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance and set session persistence
const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence) // Only persists for current session
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

// Export services
export const db = getFirestore(app);
export { auth }; // Named export
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

