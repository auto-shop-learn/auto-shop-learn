import { useState, useEffect } from "react"
import { db, auth } from "../config/firebase"
import { Auth } from "../components/auth"
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore"

const UpdateAnimal = () => {
  const animalsCollectionRef = collection(db, "animals")

  const [animalList, setAnimalList] = useState([])

  const [updatedSpecies, setUpdatedSpecies] = useState("")

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

  const updateAnimalSpecies = async (id) => {
    const animalDoc = doc(db, "animals", id)
    await updateDoc(animalDoc, { species: updatedSpecies })
    getAnimalList()
  }

  return (
    <div>
        <div>
        {animalList.map((animal) => (
                <tr key={animal.id}>
                  
                  <td className="p-0.5 border border-gray-300 flex space-x-2">
                    <div onClick={(e) => updateAnimalSpecies(animal.id)}>
                      <button>Update</button>
                    </div>
                    <input
                      className="p-0.5 border border-gray-300 rounded"
                      placeholder="New Species"
                      onChange={(e) => setUpdatedSpecies(e.target.value)}
                    />
                  </td>
                </tr>
              ))}
        </div>

    </div>
  )
}

export default UpdateAnimal
