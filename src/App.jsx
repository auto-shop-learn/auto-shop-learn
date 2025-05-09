import { Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import LandingPage from "./pages/LandingPage"
import Dashboard from "./pages/Dashboard"
import Grades from "./pages/Grades"
import Crops from "./pages/Quizzes"
import Inventory from "./pages/Videos"
import Settings from "./components/Settings"
import NewPassword from "./components/NewPassword"
import Profile from "./components/Profile"
import Team from "./components/Team"
import Info from "./components/Info"
import SearchBar from "./components/SearchBar"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import Terms from "./pages/Terms"
import AddAnimal from "./pages/AddAnimal"
import AddCrop from "./pages/AddQuiz"
import AddInventory from "./pages/AddVideo"
import ForgotPassword from "./pages/ForgotPassword"
import PrivateRoute from "./components/PrivateRoute"
import Videos from "./pages/Videos"
import AddVideo from "./pages/AddVideo"
import "tailwindcss/tailwind.css"
import { useEffect, useState } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { auth } from "../src/config/firebase";
import Quizzes from "./pages/Quizzes" // Your existing quiz list page
import QuizDetail from "./pages/QuizDetail" // Your existing quiz list page
import AddQuiz from "./pages/AddQuiz" // Page to add a new quiz

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
// Create global access to the SAME auth instance
    window.firebaseAuth = auth;
    
    // Create helpful debugging methods
    window.checkAuth = () => {
      if (auth.currentUser) {
        console.log("Logged in as:", auth.currentUser.email);
        console.log("User ID:", auth.currentUser.uid);
        console.log("Display name:", auth.currentUser.displayName);
        return auth.currentUser;
      } else {
        console.log("No user is currently logged in");
        return null;
      }
    };
    
    // Set up auth state listener using the SAME auth instance
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? `User logged in: ${user.email}` : "No user");
      setCurrentUser(user);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Make auth state available to all components via context if needed
  // You can implement a UserContext here if you want

  return (
    <>
      <Routes>
        {/* <Route path="/" element={<PrivateRoute />}> */}
        <Route path="/" element={<Dashboard />} />
        {/* </Route> */}

        <Route path="/home" element={<LandingPage />} />
        {/* <Route path="/dashboard" element={<PrivateRoute />}> */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student-dashboard" element={<Dashboard />} />
        <Route path="/teacher-dashboard" element={<Dashboard />} />
        {/* </Route> */}
        <Route path="/grades" element={<Grades />} />
        <Route path="/policy" element={<Terms />} />
        <Route path="/quiz" element={<Quizzes />} />
        {/* <Route path="/inventory" element={<Videos />} /> */}
        <Route path="/videos" element={<Videos />} />
        <Route path="/add-video" element={<AddVideo />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/add-animal" element={<AddAnimal />} />
        <Route path="/add-crop" element={<AddCrop />} />
        <Route path="/add-inventory" element={<AddInventory />} />
        <Route path="/settings/profile" element={<Profile />} />
        <Route path="/settings/new-password" element={<NewPassword />} />
        <Route path="/settings/team" element={<Team />} />
        <Route path="/settings/info" element={<Info />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        //quiz stuff
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/add-quiz" element={<AddQuiz />} />
        <Route path="/quiz/:quizId" element={<QuizDetail />} />
        {/* <Route path="/quiz/:quizId/edit" element={<EditQuiz />} /> */}
        {/* <Route path="/quiz/:quizId/results" element={<QuizResults />} /> */}
        {/* <Route path='/profile' element={<PrivateRoute />} >
            <Route path='/profile' element={<Profile />} />
          </Route> */}
      </Routes>
      <ToastContainer />
    </>
  )
}

export default App