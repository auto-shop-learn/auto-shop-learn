import { Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import LandingPage from "./pages/LandingPage"
import Dashboard from "./pages/Dashboard"
import Animals from "./pages/Animals"
import Crops from "./pages/Crops"
import Inventory from "./pages/Inventory"
import Settings from "./components/Settings"
import NewPassword from "./components/NewPassword"
import Profile from "./components/Profile"
import Team from "./components/Team"
import Info from "./components/Info"
import SearchBar from "./components/SearchBar"
import Welcome from "./pages/Welcome"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import Terms from "./pages/Terms"
import AddAnimal from "./pages/AddAnimal"
import AddCrop from "./pages/AddCrop"
import AddInventory from "./pages/AddInventory"
import UpdateAnimal from "./pages/UpdateAnimal"
import UpdateCrop from "./pages/UpdateCrop"
import UpdateInventory from "./pages/UpdateInventory"
import ForgotPassword from "./pages/ForgotPassword"
import PrivateRoute from "./components/PrivateRoute"
import "tailwindcss/tailwind.css"

import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
// import {
//     MapContainer,
//     TileLayer,
//     useMap,
//   } from 'https://cdn.esm.sh/react-leaflet'
import MarkerClusterGroup from "react-leaflet-cluster"

import { Icon, divIcon, point } from "leaflet"

function App() {
  return (
    <>
      {/* <div className="logo">
          <img src={Logo} alt="Your Logo" width="500px" />
        </div> */}

      {/* <Router> */}
      <Routes>
        {/* <Route path="/" element={<PrivateRoute />}> */}
          <Route path="/" element={<Dashboard />} />
        {/* </Route> */}

        <Route path="/home" element={<LandingPage />} />
        {/* <Route path="/dashboard" element={<PrivateRoute />}> */}
          <Route path="/dashboard" element={<Dashboard />} />
        {/* </Route> */}
        <Route path="/animals" element={<Animals />} />
        <Route path="/policy" element={<Terms />} />
        <Route path="/crops" element={<Crops />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/add-animal" element={<AddAnimal />} />
        <Route path="/add-crop" element={<AddCrop />} />
        <Route path="/add-inventory" element={<AddInventory />} />
        <Route path="/update-animal" element={<UpdateAnimal />} />
        <Route path="/update-crop" element={<UpdateCrop />} />
        <Route path="/update-inventory" element={<UpdateInventory />} />
        <Route path="/settings/profile" element={<Profile />} />
        <Route path="/settings/new-password" element={<NewPassword />} />
        <Route path="/settings/team" element={<Team />} />
        <Route path="/settings/info" element={<Info />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* <Route path='/profile' element={<PrivateRoute />} >
            <Route path='/profile' element={<Profile />} />
          </Route> */}
      </Routes>
      {/* </Router> */}
      <ToastContainer />
    </>
  )
}

export default App
