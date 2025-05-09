import Sidebar from "../components/Sidebar"
import { auth } from "../config/firebase"
// import Logo from "../assets/svg/logo.svg";
import Logo from "../assets/images/logo2.png"
import BackButton from "./BackButton"

function Info() {
  const centerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh", // This makes the div take the full viewport height
  }

  return (
    <>
      <div className="logo mt-3 mb-6">
        <img src={Logo} alt="Your Logo" width="300px" />
      </div>
      <div className="flex">
        <Sidebar />

        <div className="container mx-auto p-4" style={centerStyle}>
          <BackButton />
          <div className="bg-white p-4 shadow-lg rounded-lg">
            <h1 className="text-3xl font-semibold mb-4">User Info</h1>
            <div className="space-y-4">
              <div className="info-wrapper">
                <label className="block text-gray-700 font-medium text-base">
                  User Name:
                </label>
                <p className="mt-2 text-lg font-semibold text-black">
                  {auth?.currentUser?.displayName}
                </p>
              </div>
              <div className="info-wrapper">
                <label className="block text-gray-700 font-medium text-base">
                  Email Address:
                </label>
                <p className="mt-2 text-lg font-semibold text-black">
                  {auth?.currentUser?.email}
                </p>
              </div>
              <div className="info-wrapper">
                <label className="block text-gray-700 font-medium text-base">
                  Profile Picture:
                </label>
                <div className="mt-2">
                  {auth?.currentUser?.photoURL ? (
                    <img
                      src={auth?.currentUser.photoURL}
                      alt="Profile"
                      className="w-40 h-40 rounded-full"
                    />
                  ) : (
                    <p className="text-gray-700">
                      No profile picture available.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Info
