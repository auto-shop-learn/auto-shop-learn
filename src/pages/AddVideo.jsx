import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
// import Logo from "../assets/svg/logo.svg"
import { auth, db } from "../config/firebase"
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { toast } from "react-toastify"
import Logo from "../assets/images/logo2.png"

// Debug function to check if toast is working
const testToast = () => {
  console.log("Testing toast notification")
  toast.info("Test notification")
  toast.error("Test error notification")
}

// Add debugging helpers to global window object
window.auth = auth
window.testToast = testToast

const AddVideo = () => {
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [department, setDepartment] = useState("")
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed: ", currentUser)
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0])
      console.log("File selected:", e.target.files[0].name)
    }
  }

  const onSubmit = async (e) => {
    // Prevent the default form submission
    e.preventDefault()
    console.log("Form submitted - onSubmit function called")

    // Check if user is logged in
    if (!user) {
      console.log("User not authenticated")
      toast.error("You must be logged in to upload a video.")
      return
    }

    // Check if department is selected
    if (!department) {
      console.log("Department not selected")
      toast.error("Please select a department.")
      return
    }

    // Check if file is selected
    if (!file) {
      console.log("No file selected")
      toast.error("Please select a video file to upload.")
      return
    }

    console.log("All validation passed, setting loading state")
    setLoading(true)
    console.log("Value of user:", user)
    console.log("Value of title:", title)
    console.log("Value of description:", description)
    console.log("Value of department:", department)
    console.log("Value of file:", file)

    try {
      console.log("Starting upload process...")
      const storage = getStorage()
      const videoRef = storageRef(
        storage,
        `videos/${user.uid}/${Date.now()}_${file.name}`
      )

      console.log(
        "Uploading to path:",
        `videos/${user.uid}/${Date.now()}_${file.name}`
      )
      const uploadTask = uploadBytesResumable(videoRef, file)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const currentProgress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          )
          console.log("Upload progress:", currentProgress)
          setProgress(currentProgress)
        },
        (err) => {
          console.error("Upload error:", err)
          toast.error("Upload failed: " + err.message)
          setLoading(false)
        },
        async () => {
          console.log("Upload completed, getting download URL")
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref)
            console.log("Download URL obtained:", url)

            await addDoc(collection(db, "videos"), {
              title,
              description,
              department,
              url,
              uploadedBy: user.uid,
              createdAt: serverTimestamp(),
            })

            console.log("Document added to Firestore")
            toast.success("Video uploaded successfully")
            setLoading(false)
            navigate("/videos")
          } catch (err) {
            console.error("Error in upload completion handler:", err)
            toast.error("Error saving video information: " + err.message)
            setLoading(false)
          }
        }
      )
    } catch (err) {
      console.error("Error starting upload:", err)
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
            <label
              htmlFor="department"
              className="block text-sm font-medium text-blue-900 mb-2"
            >
              Select Department
            </label>
            <select
              id="department"
              name="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-blue-300 bg-white text-blue-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="" disabled>
                -- Select a department --
              </option>
              <option value="Sales">Sales</option>
              <option value="Compliance and Safety">
                Compliance and Safety
              </option>
              <option value="Procurement">Procurement</option>
              <option value="Product Management">Product Management</option>
              <option value="Warehouse & Logistics">
                Warehouse & Logistics
              </option>
            </select>
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
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddVideo
