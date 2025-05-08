import { useState, useEffect } from "react"
import { db, auth } from "../config/firebase"
import { Auth } from "../components/auth"
import Sidebar from "../components/Sidebar"
import { useNavigate } from "react-router-dom"
import {
  getDocs,
  collection,
  addDoc,
} from "firebase/firestore"
import Logo from "../assets/svg/logo.svg"

const AddCrop = () => {
  const navigate = useNavigate();

  const [cropList, setCropList] = useState([]);

  const [newCropType, setNewCropType] = useState("");
  const [newCropNumber, setNewCropNumber] = useState("");
  const [newCropSize, setNewCropSize] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newPlantingMethod, setNewPlantingMethod] = useState("");
  const [newPlantingDate, setNewPlantingDate] = useState("");
  const [newEstimatedHarvestDate, setNewEstimatedHarvestDate] = useState("");
  const [newGrowthStage, setNewGrowthStage] = useState("");
  const cropsCollectionRef = collection(db, "crops");

  const getCropList = async () => {
    try {
      const data = await getDocs(cropsCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      console.log(filteredData);
      setCropList(filteredData);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    getCropList();
  }, []);

  const onSubmitCrop = async (e) => {
    e.preventDefault(); // Prevent the form from submitting and refreshing the page

    try {
      await addDoc(cropsCollectionRef, {
        type: newCropType,
        number: newCropNumber,
        avgSize: newCropSize,
        area: newArea, // Add area
        plantingMethod: newPlantingMethod, // Add plantingMethod
        plantingDate: newPlantingDate, // Add plantingDate
        estimatedHarvestDate: newEstimatedHarvestDate, // Add estimatedHarvestDate
        growthStage: newGrowthStage, // Add growthStage
        userId: auth?.currentUser?.uid,
      });
      // Clear input fields
      setNewCropType("");
      setNewCropNumber("");
      setNewCropSize("");
      setNewArea("");
      setNewPlantingMethod("");
      setNewPlantingDate("");
      setNewEstimatedHarvestDate("");
      setNewGrowthStage("");

      getCropList();
      navigate("/crops");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <div className="logo">
        <img src={Logo} alt="Your Logo" width="500px" />
      </div>
      <div className="flex">
        <Sidebar />
        <div className="ml-10 mt-10">
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Quiz name"
              value={newCropType}
              onChange={(e) => setNewCropType(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Number"
              type="text"
              value={newCropNumber}
              onChange={(e) => setNewCropNumber(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Average Size"
              type="text"
              value={newCropSize}
              onChange={(e) => setNewCropSize(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Area" // Add area
              type="text" // Update the input type if needed
              value={newArea} // Use the state variable
              onChange={(e) => setNewArea(e.target.value)} // Set the state
            />
          </div>
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Planting Method" // Add plantingMethod
              type="text" // Update the input type if needed
              value={newPlantingMethod} // Use the state variable
              onChange={(e) => setNewPlantingMethod(e.target.value)} // Set the state
            />
          </div>
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Growth Stage" // Add growthStage
              type="text" // Update the input type if needed
              value={newGrowthStage} // Use the state variable
              onChange={(e) => setNewGrowthStage(e.target.value)} // Set the state
            />
          </div>
          
          <button
            className="p-2 bg-blue-700 text-white rounded hover:bg-blue-800"
            onClick={onSubmitCrop}
          >
            Add Quiz
          </button>
        </div>
      </div>
    </>
  );
}

export default AddCrop;
