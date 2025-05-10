import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { auth, db } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

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
import AddMaterial from "./pages/AddMaterial";
import AddCert from "./pages/AddCert";
import Settings from "./pages/Settings";
import EmployeeManagement from "./pages/EmployeeManagement";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch user role
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
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
          path="/videos" 
          element={currentUser ? <Videos /> : <Navigate to="/sign-in" replace />} 
        />
        <Route 
          path="/quiz" 
          element={currentUser ? <Quiz /> : <Navigate to="/sign-in" replace />} 
        />
        <Route 
          path="/certificates" 
          element={currentUser ? <Certificates /> : <Navigate to="/sign-in" replace />} 
        />
        <Route 
          path="/learning-materials" 
          element={currentUser ? <LearningMaterials /> : <Navigate to="/sign-in" replace />} 
        />
        <Route 
          path="/grades" 
          element={currentUser ? <Grades /> : <Navigate to="/sign-in" replace />} 
        />
        <Route 
          path="/add-grade" 
          element={currentUser && userRole === "Educator" ? <AddGrade /> : <Navigate to="/grades" replace />} 
        />
        <Route 
          path="/add-material" 
          element={currentUser && userRole === "Educator" ? <AddMaterial /> : <Navigate to="/learning-materials" replace />} 
        />
        <Route 
          path="/add-cert" 
          element={currentUser && userRole === "Employee" ? <AddCert /> : <Navigate to="/certificates" replace />} 
        />
        <Route 
          path="/employee-management" 
          element={currentUser && userRole === "Educator" ? <EmployeeManagement /> : <Navigate to="/dashboard" replace />} 
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