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
  const [newStatus, setNewStatus] = useState("");
  const [newFertilizationDate, setNewFertilizationDate] = useState("");
  const [newSoilType, setNewSoilType] = useState("");
  const [newSoilPH, setNewSoilPH] = useState("");
  const [newPestControl, setNewPestControl] = useState("");
  const [newActualHarvestDate, setNewActualHarvestDate] = useState("");
  const [newLastUpdate, setNewLastUpdate] = useState("");

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
        status: newStatus, // Add status
        fertilizationDate: newFertilizationDate, // Add fertilizationDate
        soilType: newSoilType, // Add soilType
        soilPH: newSoilPH, // Add soilPH
        pestControl: newPestControl, // Add pestControl
        actualHarvestDate: newActualHarvestDate, // Add actualHarvestDate
        lastUpdate: newLastUpdate, // Add lastUpdate

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
      setNewStatus("");
      setNewFertilizationDate("");
      setNewSoilType("");
      setNewSoilPH("");
      setNewPestControl("");
      setNewActualHarvestDate("");
      setNewLastUpdate("");

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
        <div>
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Crop type"
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
          {/* <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Planting Date" // Add plantingDate
              type="text" // Update the input type if needed
              value={newPlantingDate} // Use the state variable
              onChange={(e) => setNewPlantingDate(e.target.value)} // Set the state
            />
          </div> */}
          {/* <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Estimated Harvest Date" // Add estimatedHarvestDate
              type="text" // Update the input type if needed
              value={newEstimatedHarvestDate} // Use the state variable
              onChange={(e) => setNewEstimatedHarvestDate(e.target.value)} // Set the state
            />
          </div> */}
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Growth Stage" // Add growthStage
              type="text" // Update the input type if needed
              value={newGrowthStage} // Use the state variable
              onChange={(e) => setNewGrowthStage(e.target.value)} // Set the state
            />
          </div>
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Status" // Add status
              type="text" // Update the input type if needed
              value={newStatus} // Use the state variable
              onChange={(e) => setNewStatus(e.target.value)} // Set the state
            />
          </div>
          {/* <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Fertilization Date" // Add fertilizationDate
              type="text" // Update the input type if needed
              value={newFertilizationDate} // Use the state variable
              onChange={(e) => setNewFertilizationDate(e.target.value)} // Set the state
            />
          </div> */}
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Soil Type" // Add soilType
              type="text" // Update the input type if needed
              value={newSoilType} // Use the state variable
              onChange={(e) => setNewSoilType(e.target.value)} // Set the state
            />
          </div>
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Soil pH" // Add soilPH
              type="text" // Update the input type if needed
              value={newSoilPH} // Use the state variable
              onChange={(e) => setNewSoilPH(e.target.value)} // Set the state
            />
          </div>
          <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Pest Control" // Add pestControl
              type="text" // Update the input type if needed
              value={newPestControl} // Use the state variable
              onChange={(e) => setNewPestControl(e.target.value)} // Set the state
            />
          </div>
          {/* <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Actual Harvest Date" // Add actualHarvestDate
              type="text" // Update the input type if needed
              value={newActualHarvestDate} // Use the state variable
              onChange={(e) => setNewActualHarvestDate(e.target.value)} // Set the state
            />
          </div> */}
          {/* <div className="mb-2">
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Last Update" // Add lastUpdate
              type="text" // Update the input type if needed
              value={newLastUpdate} // Use the state variable
              onChange={(e) => setNewLastUpdate(e.target.value)} // Set the state
            />
          </div> */}
          <button
            className="p-2 bg-green-700 text-white rounded hover:bg-green-800"
            onClick={onSubmitCrop}
          >
            Add Crop
          </button>
        </div>
      </div>
    </>
  );
}

export default AddCrop;
