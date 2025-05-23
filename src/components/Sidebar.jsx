import backgroundImage from "../assets/images/sidebarGears.jpeg"; // <-- import your sidebar background image
import SettingsIcon from "../assets/svg/settingsIcon.svg?react";
import DashboardIcon from "../assets/svg/dashboardIcon.svg?react";
import SchoolIcon from "../assets/svg/schoolIcon.svg?react";
import TestIcon from "../assets/svg/testIcon.svg?react";
import VideoIcon from "../assets/svg/videoIcon2.svg?react";
import CertIcon from "../assets/svg/certIcon.svg?react";
import BrainIcon from "../assets/svg/brainIcon.svg?react";
import LogoutIcon from "../assets/svg/logoutIcon.svg?react";
import { Link, useLocation } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";

const Sidebar = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
    };
    fetchUserRole();
  }, []);

  const logOut = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to log out!");
    }
  };

  const linkClass = "bg-blue-700 text-white flex items-center space-x-2 rounded hover:bg-blue-700 p-2";
  const defaultClass = "flex items-center space-x-2 rounded hover:bg-blue-700 p-2";

  return (
    <div
      className="sidebar w-1/5 h-screen text-white p-4 flex flex-col justify-between bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <ul>
        <li className="mb-4">
          <Link
            to="/dashboard"
            className={location.pathname === "/dashboard" ? linkClass : defaultClass}
          >
            <DashboardIcon fill="#ffffff" width="27px" height="27px" />
            <span className="ml-2">Dashboard</span>
          </Link>
        </li>
        <li className="mb-4">
          <Link
            to="/grades"
            className={location.pathname === "/grades" ? linkClass : defaultClass}
          >
            <SchoolIcon fill="#ffffff" width="29px" height="29px" />
            <span className="ml-2">Grades</span>
          </Link>
        </li>
        <li className="mb-4">
          <Link
            to="/quiz"
            className={location.pathname === "/quiz" ? linkClass : defaultClass}
          >
            <TestIcon fill="#ffffff" width="27px" height="27px" />
            <span className="ml-2">Quizzes</span>
          </Link>
        </li>
        <li className="mb-4">
          <Link
            to="/videos"
            className={location.pathname === "/videos" ? linkClass : defaultClass}
          >
            <VideoIcon fill="#ffffff" width="27px" height="27px" />
            <span className="ml-2">Videos</span>
          </Link>
        </li>
        <li className="mb-4">
          <Link
            to="/certificates"
            className={location.pathname === "/certificates" ? linkClass : defaultClass}
          >
            <CertIcon fill="#ffffff" width="27px" height="27px" />
            <span className="ml-2">Certificates</span>
          </Link>
        </li>
        <li className="mb-4">
          <Link
            to="/learning-materials"
            className={location.pathname === "/learning-materials" ? linkClass : defaultClass}
          >
            <BrainIcon fill="#ffffff" width="21px" height="21px" />
            <span className="ml-2">Learning Materials</span>
          </Link>
        </li>
        {userRole === "Educator" && (
          <li className="mb-4">
            <Link
              to="/employee-management"
              className={location.pathname === "/employee-management" ? linkClass : defaultClass}
            >
              <SchoolIcon fill="#ffffff" width="29px" height="29px" />
              <span className="ml-2">Employee Management</span>
            </Link>
          </li>
        )}
        <li className="mb-4">
          <Link
            to="/settings"
            className={location.pathname === "/settings" ? linkClass : defaultClass}
          >
            <SettingsIcon fill="#ffffff" width="27px" height="27px" />
            <span className="ml-2">Settings</span>
          </Link>
        </li>
      </ul>
      <div>
        <Link
          onClick={logOut}
          to="/sign-in"
          className={location.pathname === "/sign-in" ? linkClass : defaultClass}
        >
          <LogoutIcon fill="#ffffff" width="27px" height="27px" />
          <span className="ml-2">Logout</span>
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
