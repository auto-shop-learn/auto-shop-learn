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

  return (
    <>
      {/* <div className="logo mt-3 mb-6">
              <img src={Logo} alt="Your Logo" width="300px" />
            </div>*/}
      <div className="flex">
        <Sidebar />
        <div className="container mx-auto py-4">
          <div className="text-blue-500 text-xl font-semibold mb-2">
            Settings
          </div>
          <div className="flex items-center space-x-10">
            <Link
              to="/settings/profile"
              className={`${
                location.pathname === "/settings/profile"
                  ? "text-blue-500"
                  : "text-black"
              }`}
              onClick={() => setActiveComponent("profile")}
            >
              Profile
            </Link>
            <Link
              to="/settings/new-password"
              className={`${
                location.pathname === "/settings/new-password"
                  ? "text-blue-500"
                  : "text-black"
              }`}
              onClick={() => setActiveComponent("new-password")}
            >
              Password
            </Link>
            <Link
              to="/settings/team"
              className={`${
                location.pathname === "/settings/team"
                  ? "text-blue-500"
                  : "text-black"
              }`}
              onClick={() => setActiveComponent("team")}
            >
              Team
            </Link>
            <Link
              to="/settings/info"
              className={`${
                location.pathname === "/settings/info"
                  ? "text-blue-500"
                  : "text-black"
              }`}
              onClick={() => setActiveComponent("info")}
            >
              Info
            </Link>
          </div>
          <div className="w-1/2 ml-1 border-b-2 border-black"></div>
          <div>{renderComponent(activeComponent)}</div>
        </div>
      </div>
    </>
  )
}

export default Settings
