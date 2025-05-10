import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";

import { 
  getAuth, 
  signInWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import visibilityIcon from "../assets/svg/visibilityIcon.svg";
import googleIcon from "../assets/svg/googleIcon.svg";

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const navigate = useNavigate();

  const { email, password, rememberMe } = formData;

  const onChange = (e) => {
    if (e.target.id === "rememberMe") {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: e.target.checked,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: e.target.value,
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        toast.success("Signed in successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Firebase error:", error.code, error.message);
      switch (error.code) {
        case "auth/user-not-found":
          toast.error("No user found with this email.");
          break;
        case "auth/wrong-password":
          toast.error("Incorrect password.");
          break;
        case "auth/invalid-email":
          toast.error("Invalid email format.");
          break;
        default:
          toast.error("Failed to sign in. Please try again.");
      }
    }
  };

  const onGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        });
      }

      toast.success("Logged in with Google successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Could not authorize with Google");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-blue-900">
            Welcome Back!
          </h2>
        </div>
        <form className="mt-4 space-y-6" onSubmit={onSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm space-y-px">
            <div className="mb-4 flex flex-col">
              <label
                htmlFor="email"
                className="text-sm text-left font-medium text-blue-900 py-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border text-blue-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={onChange}
              />
            </div>
            <div className="mb-4 flex flex-col relative">
              <label
                htmlFor="password"
                className="text-sm text-left font-medium py-2 text-blue-900"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border text-blue-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={onChange}
              />
              <div className="absolute right-3 bottom-3">
                <img
                  src={visibilityIcon}
                  alt="Show password"
                  className={`${
                    showPassword ? "opacity-100" : "opacity-70"
                  } cursor-pointer h-5 w-5`}
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-400 border-blue-400 rounded"
                checked={rememberMe}
                onChange={onChange}
              />
              <label
                htmlFor="rememberMe"
                className="block text-sm text-blue-900"
              >
                Remember Me
              </label>
            </div>
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot Password
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue
            </button>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <p className="text-sm text-blue-900">Don't have an account? </p>
            <p className="mt-2 text-center text-sm text-gray-600">
  Not a member?{" "}
  <Link to="/sign-up" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
    Sign Up
  </Link>
</p>

          </div>
        </form>

        {/* Google Sign-In Button */}
        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">Or sign in with</p>
          <button 
            onClick={onGoogleClick}
            className="mt-2 w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <img src={googleIcon} alt="Google" className="h-5 w-5 mr-2" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignIn;