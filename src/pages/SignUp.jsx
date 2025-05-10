import { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { setDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { db, auth } from "../config/firebase";
import visibilityIcon from "../assets/svg/visibilityIcon.svg";
import googleIcon from "../assets/svg/googleIcon.svg";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
  });

  const navigate = useNavigate();

  const { name, email, password, role, department } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const auth = getAuth();

      // Create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Update profile with the user's display name
      await updateProfile(auth.currentUser, {
        displayName: name,
      });

      const formDataCopy = {
        ...formData,
        userId: user.uid,
        timestamp: serverTimestamp(),
      };
      delete formDataCopy.password;

      // Save the user data to Firestore
      await setDoc(doc(db, "users", user.uid), formDataCopy);

      toast.success("Registered successfully!");

      // Redirect to the Sign-In page after successful registration
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      switch (error.code) {
        case "auth/email-already-in-use":
          toast.error("Email already in use");
          break;
        case "auth/weak-password":
          toast.error("Password should be at least 6 characters");
          break;
        case "auth/invalid-email":
          toast.error("Invalid email format");
          break;
        default:
          toast.error("Registration failed. Please try again.");
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
          role: "Employee", // Default role for Google sign-ups
          department: "General", // Default department
        });
      }

      toast.success("Registered with Google successfully!");

      // Redirect to the Dashboard after Google sign-up
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
            Sign Up for Auto Shop Learn
          </h2>
        </div>
        <form className="mt-4 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="text-sm text-left font-medium text-blue-900 py-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                autoComplete="name"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border text-blue-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder=""
                value={name}
                onChange={onChange}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-sm text-left font-medium text-blue-900 py-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border text-blue-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder=""
                value={email}
                onChange={onChange}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm text-left font-medium text-blue-900 py-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded relative block w-full px-3 py-2 border text-blue-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder=""
                  value={password}
                  onChange={onChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="text-sm text-left font-medium text-blue-900 py-1"
              >
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border text-blue-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder=""
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Select Role
              </p>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="Educator"
                    checked={role === "Educator"}
                    onChange={onChange}
                    className="form-radio text-blue-600 focus:ring-blue-500"
                    id="role"
                  />
                  <span className="ml-2 text-blue-900">Educator</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="Employee"
                    checked={role === "Employee"}
                    onChange={onChange}
                    className="form-radio text-blue-600 focus:ring-blue-500"
                    id="role"
                  />
                  <span className="ml-2 text-blue-900">Employee</span>
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-blue-900 mb-2"
              >
                Select Department
              </label>
              <select
                id="department"
                name="department"
                value={department}
                onChange={onChange}
                required
                className="block w-full px-3 py-2 border border-blue-300 bg-white text-blue-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="" disabled>
                  -- Select a department --
                </option>
                <option value="Sales">Sales</option>
                <option value="Compliance and Safety">
                  Compliance and Safety
                </option>
                <option value="Procurement">Procurement</option>
                <option value="Product Management">Product Management</option>
                <option value="Warehouse & Logistics">
                  Warehouse & Logistics
                </option>
              </select>
            </div>
          </div>

          {password && confirmPassword && password !== confirmPassword && (
            <div className="text-red-600 text-sm">Passwords do not match</div>
          )}

          <div className="text-sm text-center">
            <p>
              By creating an account, you agree to our Terms, and have read and
              acknowledge our privacy policy
            </p>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue
            </button>
          </div>
        </form>

        {/* Google Sign-In Button */}
        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">Or sign up with</p>
          <button 
            onClick={onGoogleClick}
            className="mt-2 w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <img src={googleIcon} alt="Google" className="h-5 w-5 mr-2" />
            Sign up with Google
          </button>
        </div>

        <div className="text-center text-sm">
          <Link
            to="/sign-in"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign In instead
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
