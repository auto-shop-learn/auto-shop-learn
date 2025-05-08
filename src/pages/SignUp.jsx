import { useState } from "react"
import { toast } from "react-toastify"
import { Link, useNavigate } from "react-router-dom"
import OAuth from "../components/OAuth"
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { setDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "../config/firebase";
import visibilityIcon from "../assets/svg/visibilityIcon.svg"

function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
  })

  const navigate = useNavigate()

  const { name, email, password } = formData

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      // Passwords do not match, show an error message or toast
      toast.error("Passwords do not match")
      return
    }

    try {
      const auth = getAuth()

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
        role,
        department
      )

      const user = userCredential.user

      updateProfile(auth.currentUser, {
        displayName: name,
      })

      const formDataCopy = {
        ...formData,
        userId: user.uid, // ✅ Add this line
        timestamp: serverTimestamp(),
      }
      // delete formDataCopy.password
      // delete formDataCopy.confirmPassword
      

      await setDoc(doc(db, "users", user.uid), formDataCopy)

      toast.error("Registered successfully!")
    } catch (error) {
      console.log("Before navigate to /")
      navigate("/sign-in")
      console.log("After navigate to /")
      console.error(error)

      toast.success("You have been successfully registered!")
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-blue-900">
              Sign Up for Auto Shop Learn
            </h2>
          </div>
          <form className="mt-4 space-y-6" onSubmit={onSubmit}>
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
              className="appearance-none rounded-none relative block w-full px-3 py-2 border text-blue-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder=""
              value={name}
              onChange={onChange}
            />
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
              className="appearance-none rounded-none relative block w-full px-3 py-2 border text-blue-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder=""
              value={email}
              onChange={onChange}
            />
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border text-blue-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder=""
                value={password}
                onChange={onChange}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                <img
                  src={visibilityIcon}
                  alt="Show password"
                  className={`${
                    showPassword ? "text-blue-600" : "text-blue-400"
                  } cursor-pointer`}
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              </div>
            </div>
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
              className="appearance-none rounded-none relative block w-full px-3 py-2 border text-blue-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder=""
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

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
                    checked={formData.role === "Educator"}
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
                    checked={formData.role === "Employee"}
                    onChange={onChange}
                    className="form-radio text-blue-600 focus:ring-blue-500"
                    id="role"
                  />
                  <span className="ml-2 text-blue-900">Employee</span>
                </label>
              </div>

              <label
                htmlFor="department"
                className="block text-sm font-medium text-blue-900 mb-2"
              >
                Select Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
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

            <Link
              to="/forgot-password"
              className="text-blue-600 hover:text-blue-500"
            >
              Forgot Password
            </Link>
            <h4 className="text-center text-sm">
              By creating an account, you agree to our Terms, and have read and
              acknowledge our privacy policy
            </h4>

            {password !== confirmPassword && (
              <div className="text-red-600 text-sm">Passwords do not match</div>
            )}
            <div className="flex justify-center">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continue
              </button>
            </div>
          </form>

          <OAuth />

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
    </>
  )
}

export default SignUp
