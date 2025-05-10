import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { auth } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Pages
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Videos from "./pages/Videos";
import Quiz from "./pages/Quizzes";
import Certificates from "./pages/Certificates";
import LearningMaterials from "./pages/LearningMaterials";
import Grades from "./pages/Grades";
import AddGrade from "./pages/AddGrade";
import Settings from "./pages/Settings";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      console.log("Auth state changed:", user);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/sign-up" 
          element={!currentUser ? <SignUp /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/forgot-password" 
          element={!currentUser ? <ForgotPassword /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/sign-in" 
          element={!currentUser ? <SignIn /> : <Navigate to="/sign-in" replace />} 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={currentUser ? <Dashboard /> : <Navigate to="/sign-in" replace />} 
        />
        <Route 
          path="/quiz" 
          element={currentUser ? <Quiz /> : <Navigate to="/sign-in" replace />} 
        />
        <Route 
          path="/videos" 
          element={currentUser ? <Videos /> : <Navigate to="/sign-in" replace />} 
        />
        <Route 
          path="/certificates" 
          element={currentUser ? <Certificates /> : <Navigate to="/sign-in" replace />} 
        />
        <Route 
          path="/materials" 
          element={currentUser ? <LearningMaterials /> : <Navigate to="/sign-in" replace />} 
        />
        <Route 
          path="/grades" 
          element={currentUser ? <Grades /> : <Navigate to="/sign-in" replace />} 
        />
        <Route 
          path="/add-grade" 
          element={currentUser ? <AddGrade /> : <Navigate to="/sign-in" replace />} 
        />
        <Route 
          path="/settings/*" 
          element={currentUser ? <Settings /> : <Navigate to="/sign-in" replace />} 
        />

        {/* Root Route */}
        <Route 
          path="/" 
          element={currentUser ? <Navigate to="/dashboard" replace /> : <Navigate to="/sign-in" replace />} 
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;