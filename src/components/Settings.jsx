import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"
import Profile from "./Profile"
import Team from "./Team"
import Info from "./Info"
import NewPassword from "./NewPassword"
// import Logo from "../assets/svg/logo.svg";
import Logo from "../assets/images/logo2.png"

const Settings = () => {
  const location = useLocation()
  const [activeComponent, setActiveComponent] = useState(null)

  const renderComponent = (component) => {
    switch (component) {
      case "profile":
        return <Profile />
      case "team":
        return <Team />
      case "info":
        return <Info />
      case "new-password":
        return <NewPassword />
      default:
        return null
    }
  }

  const navItems = [
    { path: "/settings/profile", label: "Profile", icon: "👤" },
    { path: "/settings/new-password", label: "Password", icon: "🔒" },
    { path: "/settings/team", label: "Team", icon: "👥" },
    { path: "/settings/info", label: "Info", icon: "ℹ️" }
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        {/* Header with Logo */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-8 py-4">
            <div className="flex items-center">
              <img src={Logo} alt="Logo" className="h-10" />
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Settings">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center py-4 px-1 border-b-2 font-medium text-sm
                        ${location.pathname === item.path
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }
                        transition-colors duration-200
                      `}
                      onClick={() => setActiveComponent(item.label.toLowerCase())}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {renderComponent(activeComponent)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
