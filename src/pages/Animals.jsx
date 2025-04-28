import { useState, useEffect } from "react"
import { db, auth } from "../config/firebase"
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore"
import Sidebar from "../components/Sidebar"
import ExtLinkIcon from "../assets/svg/extLinkIcon.svg?react"
import DeleteIcon from "../assets/svg/deleteIcon.svg?react"
import EditIcon from "../assets/svg/editIcon.svg?react"
import UpdateAnimalModal from "../components/UpdateAnimalModal" // Import the modal component
import Logo from "../assets/svg/logo.svg"
import { format } from "date-fns"
import { Link } from "react-router-dom"

const Animals = () => {
  const [animalList, setAnimalList] = useState([])

  const [newAnimalType, setNewAnimalType] = useState("")
  const [newAnimalColor, setNewAnimalColor] = useState("")

  const [updatedSpecies, setUpdatedSpecies] = useState("")
  const [updatedType, setUpdatedType] = useState("")
  const [updatedColor, setUpdatedColor] = useState("")
  const [updatedBreed, setUpdatedBreed] = useState("")
  const [updatedAge, setUpdatedAge] = useState("")

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false) // State for modal visibility
  const [selectedAnimal, setSelectedAnimal] = useState("") // State to store the selected animal for updating

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

  const onSubmitAnimal = async (e) => {
    try {
      await addDoc(animalsCollectionRef, {
        type: newAnimalType,
        color: newAnimalColor,
        userId: auth?.currentUser?.uid,
      })

      getAnimalList()
    } catch (error) {
      console.error(error)
    }
  }

  const deleteAnimal = async (id) => {
    const animalDoc = doc(db, "animals", id)
    await deleteDoc(animalDoc)
    getAnimalList()
  }

  const updateAnimal = async (id) => {
    const animalDoc = doc(db, "animals", id)
    await updateDoc(animalDoc, {
      type: updatedType,
      color: updatedColor,
      species: updatedSpecies,
      breed: updatedBreed,
      age: updatedAge,
    })
    getAnimalList()
  }

  const openUpdateModal = (animal) => {
    setSelectedAnimal(animal)
    setIsUpdateModalOpen(true)
  }

  return (
    <>
      <div className="logo">
        <img src={Logo} alt="Your Logo" width="500px" />
      </div>
      <div className="flex">
        <Sidebar />
        <div className="container mx-auto py-4">
          <div className="flex items-center space-x-4">
            {/* <input
              className="p-2 border border-gray-300 rounded"
              value={newAnimalType}
              placeholder="Animal type"
              onChange={(e) => setNewAnimalType(e.target.value)}
            />
            <input
              className="p-2 border border-gray-300 rounded"
              type="text"
              value={newAnimalColor}
              placeholder="Color"
              onChange={(e) => setNewAnimalColor(e.target.value)}
            /> */}
              <Link to="/add-animal">
            <button
              className="p-2 bg-green-700 text-white rounded hover:bg-green-700"
              onClick={() => {
                // onSubmitAnimal()
                // setNewAnimalColor("")
                // setNewAnimalType("")
              }}
            >
              + Add Animal
            </button>
              {/* <ExtLinkIcon fill="#ffffff" width={20} height={20} /> */}
            </Link>
          </div>
          <div className="mt-2">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-red-200">
                  <th className="p-0.5 border border-gray-300 w-1/6">Type</th>
                  <th className="p-0.5 border border-gray-300 w-1/6">Color</th>
                  <th className="p-0.5 border border-gray-300 w-1/6">Breed</th>
                  <th className="p-0.5 border border-gray-300 w-1/6">
                    Species
                  </th>
                  <th className="p-0.5 border border-gray-300 w-1/6">Age</th>
                  <th className="p-0.5 border border-gray-300 w-1/6">
                    Location
                  </th>
                  <th className="p-0.5 border border-gray-300 w-1/6">Gender</th>
                  {/* <th className="p-0.5 border border-gray-300 w-1/6">
                    Vaccination
                  </th> */}
                  <th className="p-0.5 border border-gray-300 w-1/6">Health</th>
                  {/* <th className="p-0.5 border border-gray-300 w-1/6">Dob</th> */}
                  <th className="p-0.5 border border-gray-300 w-1/6">
                    Actions
                  </th>
                  +
                </tr>
              </thead>
              <tbody>
                {animalList.map((animal) => (
                  <tr key={animal.id}>
                    <td className="p-0.5 border border-gray-300">
                      {animal.type}
                    </td>
                    <td className="p-0.5 border border-gray-300">
                      {animal.color}
                    </td>
                    <td className="p-0.5 border border-gray-300">
                      {animal.breed}
                    </td>
                    <td className="p-0.5 border border-gray-300">
                      {animal.species}
                    </td>
                    <td className="p-0.5 border border-gray-300">
                      {animal.age}
                    </td>
                    <td className="p-0.5 border border-gray-300">
                      {animal.location}
                    </td>
                    <td className="p-0.5 border border-gray-300">
                      {animal.gender}
                    </td>
                    {/* <td className="p-0.5 border border-gray-300">
                      {animal.vaxStatus}
                    </td> */}
                    <td className="p-0.5 border border-gray-300">
                      {animal.healthStatus}
                    </td>
                    {/* <td className="p-0.5 border border-gray-300">
                      {animal.dob instanceof Date
                        ? format(animal.dob, "MM/dd/yyyy")
                        : "N/A"}
                    </td> */}
                    <td className="p-0.5 border border-gray-300 flex space-x-2">
                      <div onClick={() => deleteAnimal(animal.id)}>
                        <DeleteIcon fill="#ffffff" width="20px" height="20px" />
                      </div>
                      <div
                        onClick={(e) => {
                          updateAnimal(animal.id)
                          openUpdateModal(animal)
                        }}
                      >
                        <EditIcon fill="#ffffff" width="20px" height="20px" />
                      </div>
                      {/* <input
                        className="p-0.5 border border-gray-300 rounded"
                        placeholder="New Type"
                        onChange={(e) => setUpdatedType(e.target.value)}
                      />
                      <input
                        className="p-0.5 border border-gray-300 rounded"
                        placeholder="New Color"
                        onChange={(e) => setUpdatedColor(e.target.value)}
                      />
                      <input
                        className="p-0.5 border border-gray-300 rounded"
                        placeholder="New Species"
                        onChange={(e) => setUpdatedSpecies(e.target.value)}
                      />
                      <input
                        className="p-0.5 border border-gray-300 rounded"
                        placeholder="New Breed"
                        onChange={(e) => setUpdatedBreed(e.target.value)}
                      />
                      <input
                        className="p-0.5 border border-gray-300 rounded"
                        placeholder="New Age"
                        onChange={(e) => setUpdatedAge(e.target.value)}
                      /> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <UpdateAnimalModal
            isOpen={isUpdateModalOpen}
            onRequestClose={() => setIsUpdateModalOpen(false)}
            onUpdateAnimal={updateAnimal}
            initialData={selectedAnimal}
          />
        </div>
      </div>
    </>
  )
}

export default Animals
