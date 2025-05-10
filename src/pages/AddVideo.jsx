import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { auth, db } from "../config/firebase"
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage"
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  increment,
  arrayUnion
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { toast } from "react-toastify"
import Logo from "../assets/images/logo2.png"

const AddVideo = () => {
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [department, setDepartment] = useState("")
  const [courseName, setCourseName] = useState("")
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        try {
          // Fetch user's information from users collection
          const userDocRef = doc(db, "users", currentUser.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            const data = userDoc.data()
            setUserInfo(data)
            // Set department from user's profile
            if (data.department) {
              setDepartment(data.department)
            } else {
              toast.error("Your account doesn't have a department assigned.")
            }
          } else {
            toast.error("No user profile found.")
            navigate("/profile")
          }
        } catch (err) {
          console.error("Error fetching user info:", err)
          toast.error("Error loading your user information")
        }
      }
    })
    return () => unsubscribe()
  }, [navigate])

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      toast.error("You must be logged in to upload a video.")
      return
    }

    if (!department) {
      toast.error("Your account doesn't have a department assigned.")
      return
    }

    if (!courseName) {
      toast.error("Please enter a course name.")
      return
    }

    if (!file) {
      toast.error("Please select a video file to upload.")
      return
    }

    setLoading(true)

    try {
      const storage = getStorage()
      const videoRef = storageRef(
        storage,
        `videos/${user.uid}/${Date.now()}_${file.name}`
      )

      const uploadTask = uploadBytesResumable(videoRef, file)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const currentProgress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          )
          setProgress(currentProgress)
        },
        (err) => {
          toast.error("Upload failed: " + err.message)
          setLoading(false)
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref)

            // Add to videos collection
            const videoDocRef = await addDoc(collection(db, "videos"), {
              title,
              description,
              department,
              courseName,
              url,
              uploadedBy: user.uid,
              educatorName: userInfo?.name || "Unknown Educator",
              createdAt: serverTimestamp(),
            })

            // Also add to courses collection
            const coursesCollection = collection(db, "courses")
            const courseQuery = await getDocs(
              query(coursesCollection, 
                where("name", "==", courseName), 
                where("department", "==", department))
            )

            if (courseQuery.empty) {
              // Course doesn't exist, create it
              await addDoc(coursesCollection, {
                name: courseName,
                department,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
                videoCount: 1,
                videos: [videoDocRef.id]
              })
            } else {
              // Course exists, update it
              const courseDoc = courseQuery.docs[0]
              await updateDoc(courseDoc.ref, {
                videoCount: increment(1),
                videos: arrayUnion(videoDocRef.id),
                updatedAt: serverTimestamp()
              })
            }

            toast.success("Video uploaded successfully")
            setLoading(false)
            navigate("/dashboard/videos")
          } catch (err) {
            toast.error("Error saving video information: " + err.message)
            setLoading(false)
          }
        }
      )
    } catch (err) {
      toast.error("Upload failed: " + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <img src={Logo} alt="Logo" className="h-12 mb-4" />
          <h1 className="text-2xl font-semibold mb-4">Upload New Video</h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Course Name</label>
            <input
              type="text"
              required
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter the course name this video belongs to"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Department</label>
            <input
              type="text"
              value={department || "Loading..."}
              className="w-full p-2 border rounded bg-gray-100"
              readOnly
            />
            {!department && (
              <p className="text-sm text-red-500 mt-1">
                Your account doesn't have a department assigned. Please contact support.
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Video File</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="block"
              required
            />
          </div>
          {progress > 0 && (
            <div className="text-sm text-blue-600">
              Uploading: {progress}%
            </div>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600"
            disabled={loading || !department}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddVideo