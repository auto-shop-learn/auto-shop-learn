// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7cI0cbWP7HN1zu1ALm76g7EC79h7oa3k",
  authDomain: "fir-course-31ca9.firebaseapp.com",
  projectId: "fir-course-31ca9",
  storageBucket: "fir-course-31ca9.appspot.com",
  messagingSenderId: "1088498704402",
  appId: "1:1088498704402:web:f64d8ea87691f57c2678cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
 