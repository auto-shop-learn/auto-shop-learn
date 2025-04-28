import { useState, useEffect } from "react"
import { db, auth } from "../config/firebase"
import { Auth } from "../components/auth"
import Sidebar from "../components/Sidebar"
import { useNavigate } from "react-router-dom"
import { getDocs, collection, addDoc } from "firebase/firestore"
import Logo from "../assets/svg/logo.svg"

const AddAnimal = () => {
  const navigate = useNavigate()

  const [animalList, setAnimalList] = useState([])

  const [newAnimalType, setNewAnimalType] = useState("")
  const [newAnimalColor, setNewAnimalColor] = useState("")
  const [newAnimalBreed, setNewAnimalBreed] = useState("")
  const [newAnimalSpecies, setNewAnimalSpecies] = useState("")
  const [newAnimalAge, setNewAnimalAge] = useState("")
  const [newAnimalLocation, setNewAnimalLocation] = useState("")
  const [newAnimalGender, setNewAnimalGender] = useState("")
  const [newAnimalVaccinationStatus, setNewAnimalVaccinationStatus] =
    useState("")
  const [newAnimalHealthStatus, setNewAnimalHealthStatus] = useState("")
  const [newAnimalDob, setNewAnimalDob] = useState("")
  const [errors, setErrors] = useState({}); // Initialize an empty errors object

  const animalsCollectionRef = collection(db, "animals")

  const getAnimalList = async () => {
    try {
      const data = await getDocs(animalsCollectionRef)
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
      console.log(filteredData)
      setAnimalList(filteredData)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getAnimalList()
  }, [])

  const validateTextInput = (inputValue) => {
    return /^[A-Za-z\s]+$/.test(inputValue)
  }

  const validateNumberInput = (inputValue) => {
    return /^\d+$/.test(inputValue)
  }

  const validateNotEmpty = (inputValue) => {
    return inputValue.trim() !== "" // Check if the input is not empty
  }

  const onSubmitAnimal = async (e) => {
    e.preventDefault() // Prevent the form from submitting and refreshing the page

    const newErrors = {};
    if (!validateNotEmpty(newAnimalType)) {
      newErrors.newAnimalType = "Animal type is required.";
    }
    if (!validateNotEmpty(newAnimalBreed)) {
      newErrors.newAnimalBreed = "Breed is required.";
    }
    if (!validateNotEmpty(newAnimalAge)) {
      newErrors.newAnimalAge = "Age is required.";
    }
    if (!validateNotEmpty(newAnimalSpecies)) {
      newErrors.newAnimalSpecies = "Species is required.";
    }
    if (!validateNotEmpty(newAnimalGender)) {
      newErrors.newAnimalGender = "Gender is required.";
    }
    if (!validateNumberInput(newAnimalAge)) {
      newErrors.newAnimalAge = "Age must be a number.";
    }
    if (!validateTextInput(newAnimalColor)) {
      newErrors.newAnimalColor = "Color must be a valid text.";
    }

    if (Object.keys(newErrors).length === 0) {
      try {
        await addDoc(animalsCollectionRef, {
          type: newAnimalType,
          breed: newAnimalBreed,
          species: newAnimalSpecies,
          age: newAnimalAge,
          location: newAnimalLocation,
          gender: newAnimalGender,
          color: newAnimalColor, // Include color
          vaccinationStatus: newAnimalVaccinationStatus,
          healthStatus: newAnimalHealthStatus,
          dob: newAnimalDob,
          userId: auth?.currentUser?.uid,
        });
        // Clear input fields
        setNewAnimalType("");
        setNewAnimalBreed("");
        setNewAnimalSpecies("");
        setNewAnimalAge("");
        setNewAnimalLocation("");
        setNewAnimalGender("");
        setNewAnimalColor(""); // Clear color
        setNewAnimalVaccinationStatus("");
        setNewAnimalHealthStatus("");
        setNewAnimalDob("");
        setErrors({}); // Clear validation errors
        getAnimalList();
        navigate("/animals");
      } catch (error) {
        console.error(error);
      }
    } else {
      setErrors(newErrors); // Set validation errors
    }
  }

  return (
    <>
      <div className="logo">
        <img src={Logo} alt="Your Logo" width="500px" />
      </div>
      <div className="flex">
        <Sidebar />
        {/* <Auth /> */}
        <div>
        <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Animal type"
              value={newAnimalType}
              onChange={(e) => setNewAnimalType(e.target.value)}
            />
            {errors.newAnimalType && (
              <div className="text-red-500">{errors.newAnimalType}</div>
            )}
          </div>
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Color"
              type="text"
              value={newAnimalColor}
              onChange={(e) => setNewAnimalColor(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Breed"
              value={newAnimalBreed}
              onChange={(e) => setNewAnimalBreed(e.target.value)}
            />
            {errors.newAnimalBreed && (
              <div className="text-red-500">{errors.newAnimalBreed}</div>
            )}
          </div>
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Species"
              value={newAnimalSpecies}
              onChange={(e) => setNewAnimalSpecies(e.target.value)}
            />
            {errors.newAnimalSpecies && (
              <div className="text-red-500">{errors.newAnimalSpecies}</div>
            )}
          </div>
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Age"
              value={newAnimalAge}
              onChange={(e) => setNewAnimalAge(e.target.value)}
            />
            {errors.newAnimalAge && (
              <div className="text-red-500">{errors.newAnimalAge}</div>
            )}
          </div>
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Location"
              type="text"
              value={newAnimalLocation}
              onChange={(e) => setNewAnimalLocation(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Gender"
              type="text"
              value={newAnimalGender}
              onChange={(e) => setNewAnimalGender(e.target.value)}
            />
            {errors.newAnimalGender && (
              <div className="text-red-500">{errors.newAnimalGender}</div>
            )}
          </div>
          
          {/* <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Vaccination Status"
              type="text"
              value={newAnimalVaccinationStatus}
              onChange={(e) => setNewAnimalVaccinationStatus(e.target.value)}
            />
          </div> */}
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Health Status"
              type="text"
              value={newAnimalHealthStatus}
              onChange={(e) => setNewAnimalHealthStatus(e.target.value)}
            />
          </div>
          {/* <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Date of Birth"
              type="date"
              value={newAnimalDob}
              onChange={(e) => setNewAnimalDob(e.target.value)}
            />
          </div> */}
          <button
            className="p-2 bg-green-700 text-white rounded hover-bg-green-800"
            onClick={onSubmitAnimal}
          >
            Add Animal
          </button>
        </div>
      </div>
    </>
  )
}

export default AddAnimal
