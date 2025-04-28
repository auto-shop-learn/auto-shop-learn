import { useState } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import OAuth from "../components/OAuth";
import visibilityIcon from "../assets/svg/visibilityIcon.svg";

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
      const auth = getAuth();

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (userCredential.user) {
        navigate("/");
      }
    } catch (error) {
      toast.error("Bad user credentials");
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-green-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-green-900">
              Welcome Back!
            </h2>
          </div>
          <form className="mt-4 space-y-6" onSubmit={onSubmit}>
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm space-y-px">
              <div className="mb-4 flex flex-col">
                <label htmlFor="email" className="text-sm text-left font-medium text-green-900 py-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border text-green-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                  value={email}
                  onChange={onChange}
                />
              </div>
              <div className="mb-4 flex flex-col">
                <label htmlFor="password" className="text-sm text-left font-medium py-2 text-green-900">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border text-green-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={onChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                  <img
                    src={visibilityIcon}
                    alt="Show password"
                    className={`${
                      showPassword ? "text-green-600" : "text-green-400"
                    } cursor-pointer`}
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
                  className="h-4 w-4 text-green-600 focus:ring-green-400 border-green-400 rounded"
                  checked={rememberMe}
                  onChange={onChange}
                />
                <label
                  htmlFor="rememberMe"
                  className="block text-sm text-green-900"
                >
                  Remember Me
                </label>
              </div>
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Forgot Password
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Continue
              </button>
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <p className="text-sm text-green-900">
                Don`t have an account?{" "}
              </p>
              <Link
                to="/sign-up"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign Up
              </Link>
            </div>
          </form>

          <OAuth />
        </div>
      </div>
    </>
  );
}

export default SignIn;
