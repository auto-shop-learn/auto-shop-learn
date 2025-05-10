import { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate, Link, Routes, Route } from "react-router-dom";
import { db, auth } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import Logo from "../../assets/images/logo2.png";
import SettingsGif from "../../assets/images/settings2.gif";

// Lazy load settings components
const ProfileSettings = lazy(() => import("./ProfileSettings"));
const SecuritySettings = lazy(() => import("./SecuritySettings"));
const NotificationSettings = lazy(() => import("./NotificationSettings"));
const Preferences = lazy(() => import("./Preferences"));
const EducatorSettings = lazy(() => import("./EducatorSettings"));

const Settings = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Settings Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img src={Logo} alt="Logo" className="h-8" />
            <h2 className="text-xl font-bold text-gray-800">Settings</h2>
          </div>
        </div>
        <nav className="mt-4">
          <Link
            to="/settings/profile"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            Profile Settings
          </Link>
          <Link
            to="/settings/security"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            Security
          </Link>
          <Link
            to="/settings/notifications"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            Notifications
          </Link>
          <Link
            to="/settings/preferences"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            Preferences
          </Link>
          {userRole === "educator" && (
            <Link
              to="/settings/educator"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              Educator Settings
            </Link>
          )}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <Suspense fallback={
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }>
            <Routes>
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="security" element={<SecuritySettings />} />
              <Route path="notifications" element={<NotificationSettings />} />
              <Route path="preferences" element={<Preferences />} />
              {userRole === "educator" && (
                <Route path="educator" element={<EducatorSettings />} />
              )}
              <Route
                path="*"
                element={
                  <div className="text-center py-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      Welcome to Settings
                    </h2>
                    <p className="text-gray-600">
                      Please select a setting category from the sidebar to get started.
                    </p>
                    <img src={SettingsGif} alt="Settings" className="mx-auto mt-20 mb-6 w-18" />
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Settings; 