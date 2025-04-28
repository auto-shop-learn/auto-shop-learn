import { auth, googleProvider } from "../config/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { useState } from "react";

export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    console.log(auth?.currentUser?.email);
    

    const signIn = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.error(err);
        }
    }
    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error(err);
        }
    }
    const logOut = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-96">
                <input className="mb-4 p-2 border rounded" placeholder="email" onChange={(e) => setEmail(e.target.value)} />
                <input className="mb-4 p-2 border rounded" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={signIn}>Sign in</button>

                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2" onClick={signInWithGoogle}>Sign in with Google</button>

                <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-2" onClick={logOut}>Log Out</button>
            </div>
        </div>
    )
}
