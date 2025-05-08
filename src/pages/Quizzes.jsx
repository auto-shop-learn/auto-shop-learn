import { useState, useEffect } from "react"
import { db, auth } from "../config/firebase"
import { Auth } from "../components/auth"
import Sidebar from "../components/Sidebar"
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore"
import ExtLinkIcon from "../assets/svg/extLinkIcon.svg?react"
import DeleteIcon from "../assets/svg/deleteIcon.svg?react"
import EditIcon from "../assets/svg/editIcon.svg?react"
import Logo from "../assets/svg/logo.svg"
import { format } from "date-fns"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"


const Quizzes = () => {
    const navigate = useNavigate()
  
  const [cropList, setCropList] = useState([])
  const [selectedCrop, setSelectedCrop] = useState(null)

  const [newCropType, setNewCropType] = useState("")
  const [newCropNumber, setNewCropNumber] = useState("")

  const [updatedSize, setUpdatedSize] = useState("")
  const [updatedNumber, setUpdatedNumber] = useState("")
  const [updatedType, setUpdatedType] = useState("")

  const cropsCollectionRef = collection(db, "crops")

  const getCropList = async () => {
    try {
      const data = await getDocs(cropsCollectionRef)
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
      console.log(filteredData)
      setCropList(filteredData)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getCropList()
  }, [])

  const onSubmitCrop = async (e) => {
    try {
      await addDoc(cropsCollectionRef, {
        type: newCropType,
        number: newCropNumber,
        userId: auth?.currentUser?.uid,
      })
      getCropList()
    } catch (error) {
      console.error(error)
    }
  }

  const deleteCrop = async (id) => {
    const cropDoc = doc(db, "crops", id)
    await deleteDoc(cropDoc)
    getCropList()
  }
  
  const updateCrop = async (id) => {
    const cropDoc = doc(db, "crops", id)
    await updateDoc(cropDoc, {
      avgSize: updatedSize,
      number: updatedNumber,
      type: updatedType,
    })
    getCropList()
    setSelectedCrop(null)
  }

  return (
    <>
      <div className="logo">
        <img src={Logo} alt="Your Logo" width="500" />
      </div>
      <div className="flex">
        <Sidebar />
        <div className="container mx-auto py-4">
          <div className="flex items-center space-x-4 mb-4">
            <Link to='/add-crop'>
              <button
                className="p-2 bg-blue-700 text-white rounded hover:bg-blue-700"
                onClick={onSubmitCrop}
              >
                + Add Quiz
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cropList.map((crop) => (
              <div key={crop.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="bg-blue-200 p-3 font-semibold text-lg flex justify-between items-center">
                  <span>{crop.type || "Untitled Quiz"}</span>
                  <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/quiz/${quizzes.quizId}`)}
                    className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Start Quiz
                  </button>
                    <button onClick={() => deleteCrop(crop.id)} className="hover:bg-red-100 p-1 rounded">
                      <DeleteIcon width={20} height={20} />
                    </button>
                    <button onClick={() => setSelectedCrop(crop.id === selectedCrop ? null : crop.id)} className="hover:bg-blue-100 p-1 rounded">
                      <EditIcon width={20} height={20} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-1">
                      <span className="font-medium">Quiz Type</span>
                      <span>{crop.type || "N/A"}</span>
                    </div>
                    
                    <div className="flex justify-between border-b pb-1">
                      <span className="font-medium">Number of Questions:</span>
                      <span>{crop.number || "N/A"}</span>
                    </div>
                    
                    <div className="flex justify-between border-b pb-1">
                      <span className="font-medium">Difficulty Level:</span>
                      <span>{crop.avgSize || "N/A"}</span>
                    </div>
                    
                    <div className="flex justify-between border-b pb-1">
                      <span className="font-medium">Quiz ID:</span>
                      <span>{crop.batchID || "N/A"}</span>
                    </div>
                    
                    <div className="flex justify-between border-b pb-1">
                      <span className="font-medium">Category:</span>
                      <span>{crop.area || "N/A"}</span>
                    </div>
                    
                    <div className="flex justify-between border-b pb-1">
                      <span className="font-medium">Status:</span>
                      <span>{crop.growthStage || "N/A"}</span>
                    </div>
                    
                  </div>

                  {selectedCrop === crop.id && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <h3 className="font-medium mb-2">Edit Quiz</h3>
                      <div className="space-y-2">
                        <input
                          className="w-full p-2 border border-gray-300 rounded"
                          placeholder="New Type"
                          onChange={(e) => setUpdatedType(e.target.value)}
                        />
                        <input
                          className="w-full p-2 border border-gray-300 rounded"
                          placeholder="New Number"
                          onChange={(e) => setUpdatedNumber(e.target.value)}
                        />
                        <input
                          className="w-full p-2 border border-gray-300 rounded"
                          placeholder="New Size"
                          onChange={(e) => setUpdatedSize(e.target.value)}
                        />
                        <button
                          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={() => updateCrop(crop.id)}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Quizzes