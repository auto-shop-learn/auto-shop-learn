import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Logo from "../assets/svg/logo.svg";
import Settings from "../components/Settings";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton"



function Profile() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");


  const countries = ["USA", "Canada", "UK", "Australia", "South Africa", "Zimbabwe", "Botswana", "Other"];

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user's profile data and populate the state
    const userId = "your_user_id_here"; // Replace with the actual UID of the user
    const profileRef = doc(db, "farmer", userId); // Use the user's UID to reference the document

    const fetchData = async () => {
      try {
        const profileSnapshot = await getDoc(profileRef);
        if (profileSnapshot.exists()) {
          const profileData = profileSnapshot.data();
          // Update state variables with the fetched data
          setUserName(profileData.name);
          setEmail(profileData.email);
          setCellphone(profileData.cellphoneNum);
          setCountry(profileData.country);
          setCity(profileData.city);

        }
      } catch (error) {
        console.error("Error fetching user profile data:", error);
      }
    };

    fetchData();
  }, [userName, email, cellphone, country, city]); // Add appropriate dependencies

  const handleUserNameChange = (e) => {
    setUserName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleCellphoneChange = (e) => {
    setCellphone(e.target.value);
  };

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Update the user's profile data in Firestore
    try {
      const profileRef = doc(db, "farmer", "1"); // Assuming document ID is "1"
      const data = {
        name: userName,
        email: email,
        cellphoneNum: cellphone,
        country: country,
        city: city,
      };

      await updateDoc(profileRef, data);
      navigate("/");
      toast.success("User Profile Data Updated");
    } catch (error) {
      toast.error("Error updating profile:", error);
    }
  };

  return (
    <>
      <div className="logo">
        <img src={Logo} alt="Your Logo" width="500px" />
      </div>
      <div className="flex">
        <Sidebar />
    <BackButton></BackButton>

        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-semibold mb-4">User Profile</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="userName"
                className="block text-sm font-medium text-gray-700"
              >
                User Name:
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={handleUserNameChange}
                required
                className="mt-1 p-2 border rounded-md w-full max-w-xs focus:ring focus:ring-blue-300"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email:
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                required
                className="mt-1 p-2 border rounded-md w-full max-w-xs focus:ring focus:ring-blue-300"
              />
            </div>
            <div>
              <label
                htmlFor="cellphone"
                className="block text-sm font-medium text-gray-700"
              >
                Cellphone No:
              </label>
              <input
                type="tel"
                id="cellphone"
                value={cellphone}
                onChange={handleCellphoneChange}
                required
                className="mt-1 p-2 border rounded-md w-full max-w-xs focus:ring focus:ring-blue-300"
              />
            </div>
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700"
              >
                Country:
              </label>
              <select
                id="country"
                value={country}
                onChange={handleCountryChange}
                required
                className="mt-1 p-2 border rounded-md w-full max-w-xs focus:ring focus:ring-blue-300"
              >
                <option value="">Select a country</option>
                {countries.map((countryName) => (
                  <option key={countryName} value={countryName}>
                    {countryName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                City:
              </label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={handleCityChange}
                required
                className="mt-1 p-2 border rounded-md w-full max-w-xs focus:ring focus:ring-blue-300"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-blue-600"
            >
              Save Profile
            </button>
          </form>
          
        </div>
      </div>
    </>
  );
}

export default Profile;
