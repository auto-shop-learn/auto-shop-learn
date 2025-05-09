// src/pages/Videos.jsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
// import Logo from "../assets/svg/logo.svg"
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

const Videos = () => {
  const [videos, setVideos] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchVideos = async () => {
      const q = query(collection(db, "videos"), orderBy("createdAt", "desc"))
      const snap = await getDocs(q)
      setVideos(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          rating: doc.data().rating || 0,
          completed: doc.data().completed || false,
        }))
      )
    }
    fetchVideos()
  }, [])

  // Function to handle rating changes
  const handleRatingChange = async (videoId, newRating) => {
    try {
      // Update in Firestore
      const videoRef = doc(db, "videos", videoId)
      await updateDoc(videoRef, {
        rating: newRating,
      })

      // Update local state
      setVideos(
        videos.map((video) =>
          video.id === videoId ? { ...video, rating: newRating } : video
        )
      )
    } catch (error) {
      console.error("Error updating rating:", error)
    }
  }

  // Function to handle completion toggle
  const handleCompletionToggle = async (videoId, isCompleted) => {
    try {
      // Update in Firestore
      const videoRef = doc(db, "videos", videoId)
      await updateDoc(videoRef, {
        completed: isCompleted,
      })

      // Update local state
      setVideos(
        videos.map((video) =>
          video.id === videoId ? { ...video, completed: isCompleted } : video
        )
      )
    } catch (error) {
      console.error("Error updating completion status:", error)
    }
  }

  // Star rating component
  const StarRating = ({ videoId, currentRating }) => {
    return (
      <div className="flex items-center mt-2">
        <span className="mr-2 text-sm text-gray-600">Rating:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRatingChange(videoId, star)}
            className="focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill={star <= currentRating ? "gold" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="logo mt-3 mb-6">
        <img src={Logo} alt="Your Logo" width="300px" />
      </div>
      <div className="flex">
        <Sidebar />
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">All Training Videos</h1>
            <button
              onClick={() => navigate("/add-video")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              + Add Video
            </button>
          </div>

          <div className="space-y-8">
            {videos.map((v) => (
              <div key={v.id} className="border p-4 rounded-lg shadow-sm">
                <div className="flex justify-between mb-2">
                  <h2 className="font-medium">{v.title}</h2>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer mr-4">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={v.completed}
                        onChange={(e) =>
                          handleCompletionToggle(v.id, e.target.checked)
                        }
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Completed
                      </span>
                    </label>
                  </div>
                </div>
                <video src={v.url} controls className="w-full max-w-xl" />
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-3">
                  <StarRating videoId={v.id} currentRating={v.rating} />
                  {v.completed && (
                    <span className="mt-2 md:mt-0 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
            {videos.length === 0 && (
              <p className="text-gray-600">No videos uploaded yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Videos
