// src/pages/LearningMaterials.jsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Logo from "../assets/images/logo2.png"
import { db } from "../config/firebase"
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore"

const LearningMaterials = () => {
  const [materials, setMaterials] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMaterials = async () => {
      const q = query(
        collection(db, "learningMaterials"),
        orderBy("createdAt", "desc")
      )
      const snap = await getDocs(q)
      setMaterials(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          rating: d.data().rating || 0,
          read: d.data().read || false,
        }))
      )
    }
    fetchMaterials()
  }, [])

  // Update star rating
  const handleRatingChange = async (id, newRating) => {
    const ref = doc(db, "learningMaterials", id)
    await updateDoc(ref, { rating: newRating })
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, rating: newRating } : m
      )
    )
  }

  // Toggle read status
  const handleReadToggle = async (id, isRead) => {
    const ref = doc(db, "learningMaterials", id)
    await updateDoc(ref, { read: isRead })
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, read: isRead } : m
      )
    )
  }

  const StarRating = ({ id, rating }) => (
    <div className="flex items-center mt-2">
      <span className="mr-2 text-sm text-gray-600">Rating:</span>
      {[1,2,3,4,5].map((star) => (
        <button
          key={star}
          onClick={() => handleRatingChange(id, star)}
          className="focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill={star <= rating ? "gold" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519..."
            />
          </svg>
        </button>
      ))}
    </div>
  )

  return (
    <>
      <div className="logo my-4">
        <img src={Logo} alt="Logo" width="300px" />
      </div>
      <div className="flex">
        <Sidebar />
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Learning Materials</h1>
            <button
              onClick={() => navigate("/add-material")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Add Material
            </button>
          </div>

          <div className="space-y-8">
            {materials.map((m) => (
              <div
                key={m.id}
                className="border p-4 rounded-lg shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-medium">{m.title}</h2>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600"
                      checked={m.read}
                      onChange={(e) =>
                        handleReadToggle(m.id, e.target.checked)
                      }
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Read
                    </span>
                  </label>
                </div>

                <p className="text-sm text-gray-700 mb-2">
                  {m.description}
                </p>

                <a
                  href={m.url}
                  download
                  className="inline-block text-blue-600 hover:underline mb-3"
                >
                  Download {m.fileType?.toUpperCase()}
                </a>

                <StarRating id={m.id} rating={m.rating} />
                {m.read && (
                  <span className="mt-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    ✓ Read
                  </span>
                )}
              </div>
            ))}

            {materials.length === 0 && (
              <p className="text-gray-600">
                No materials uploaded yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default LearningMaterials
