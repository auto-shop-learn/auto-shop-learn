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
  deleteDoc
} from "firebase/firestore"
import { toast } from "react-toastify"

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

  const handleDeleteMaterial = async (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await deleteDoc(doc(db, "learningMaterials", id));
        setMaterials(materials.filter(material => material.id !== id));
        toast.success("Material deleted successfully");
      } catch (error) {
        console.error("Error deleting material:", error);
        toast.error("Failed to delete material");
      }
    }
  };

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
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <img src={Logo} alt="Logo" className="h-12 mb-4" />
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Learning Materials</h1>
            <button
              onClick={() => navigate("/add-material")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Add Notes
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {materials.map((m) => (
            <div
              key={m.id}
              className="border p-4 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-medium">{m.title}</h2>
                <div className="flex items-center gap-4">
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
                  <button
                    onClick={() => handleDeleteMaterial(m.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete Material"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
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
  )
}

export default LearningMaterials
