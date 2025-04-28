import { useState } from "react";
import { getAuth, updatePassword } from "firebase/auth";
import Sidebar from "../components/Sidebar";
import Logo from "../assets/svg/logo.svg";
import Settings from "../components/Settings";
import BackButton from "./BackButton"


const NewPassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      await updatePassword(user, newPassword);
      // Password updated successfully
      setErrorMessage(null);
      // You can also show a success message here
    } catch (error) {
      // An error occurred while updating the password
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
    <BackButton></BackButton>

      <div className="container mx-auto py-4 ml-14">
        <h1 className="text-3xl text-green text-center font-semibold mb-4">
          Change your password
        </h1>
        <div className="flex flex-col">
          <div className="mb-4">
            <label htmlFor="currentPassword" className="block text-lg mb-2">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              className="border border-gray-300 rounded p-2"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-lg mb-2">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              className="border border-gray-300 rounded p-2"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmNewPassword" className="block text-lg mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              className="border border-gray-300 rounded p-2"
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>
          {errorMessage && (
            <div className="text-red-600 mb-4">{errorMessage}</div>
          )}
        </div>
        <button
          className="bg-green-700 text-white py-2 px-4 ml-12 rounded hover:bg-green-600"
          onClick={handleUpdatePassword}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default NewPassword;
