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
  deleteDoc,
  where,
  getDoc,
  setDoc
} from "firebase/firestore"
import { toast } from "react-toastify"
import { useAuth } from "../contexts/AuthContext"
import VideoPlayer from "../components/VideoPlayer"
import PropTypes from 'prop-types'

const Videos = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videosCollection = collection(db, "videos")
        const videosSnapshot = await getDocs(videosCollection)
        const videosList = videosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        setVideos(videosList)
      } catch (error) {
        console.error("Error fetching videos:", error)
        toast.error("Failed to load videos")
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  const handleVideoProgress = async (videoId, completed) => {
    if (!currentUser) return

    try {
      // Update video completion status in Firestore
      const videoRef = doc(db, "videos", videoId)
      await updateDoc(videoRef, {
        completed: completed
      })

      // Update local state
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === videoId
            ? { ...video, completed }
            : video
        )
      )

      // Update user progress
      const userProgressRef = doc(db, "userProgress", currentUser.uid)
      const userProgressDoc = await getDoc(userProgressRef)
      
      const completedVideos = userProgressDoc.exists() 
        ? userProgressDoc.data().completedVideos || []
        : []

      // Check if video is already in completedVideos
      const videoIndex = completedVideos.findIndex(v => v.videoId === videoId)
      
      if (completed && videoIndex === -1) {
        // Add video to completedVideos if it's completed and not already there
        completedVideos.push({
          videoId,
          completedAt: new Date(),
          title: videos.find(v => v.id === videoId)?.title || 'Unknown Video'
        })
      } else if (!completed && videoIndex !== -1) {
        // Remove video from completedVideos if it's not completed
        completedVideos.splice(videoIndex, 1)
      }

      // Update userProgress document
      await setDoc(userProgressRef, {
        userId: currentUser.uid,
        completedVideos,
        lastUpdated: new Date()
      }, { merge: true })

      // Check if all videos are completed
      const allVideosCompleted = videos.every((v) => v.completed)
      if (allVideosCompleted) {
        toast.success("Congratulations! You have completed all videos! 🎉")
      }
    } catch (error) {
      console.error("Error updating video completion:", error)
      toast.error("Failed to update video completion status")
    }
  }

  const handleRatingChange = async (videoId, newRating) => {
    try {
      const videoRef = doc(db, "videos", videoId)
      await updateDoc(videoRef, {
        rating: newRating
      })

      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === videoId
            ? { ...video, rating: newRating }
            : video
        )
      )

      toast.success("Rating updated successfully")
    } catch (error) {
      console.error("Error updating rating:", error)
      toast.error("Failed to update rating")
    }
  }

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return

    try {
      await deleteDoc(doc(db, "videos", videoId))
      setVideos((prevVideos) => prevVideos.filter((video) => video.id !== videoId))
      toast.success("Video deleted successfully")
    } catch (error) {
      console.error("Error deleting video:", error)
      toast.error("Failed to delete video")
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Training Videos</h1>
          
          <div className="space-y-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">{video.title}</h2>
                  <div className="flex items-center space-x-4">
                    <StarRating
                      rating={video.rating || 0}
                      onRatingChange={(rating) => handleRatingChange(video.id, rating)}
                    />
                    {currentUser?.role === "educator" && (
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                
                <VideoPlayer
                  video={video}
                  userId={currentUser?.uid}
                  onProgressUpdate={handleVideoProgress}
                />

                <p className="mt-4 text-gray-600">{video.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const StarRating = ({ rating, onRatingChange }) => {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className="flex items-center space-x-1">
      {stars.map((star) => (
        <button
          key={star}
          onClick={() => onRatingChange(star)}
          className="focus:outline-none"
        >
          <svg
            className={`w-5 h-5 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  onRatingChange: PropTypes.func.isRequired
}

export default Videos
