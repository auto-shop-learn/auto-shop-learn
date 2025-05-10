import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Logo from "../assets/images/logo2.png"
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
  getDocs,
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { toast } from "react-toastify"

const AddMaterial = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [title, setTitle] = useState("")
  const [courseName, setCourseName] = useState("")
  const [department, setDepartment] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState(null)
  const [fileType, setFileType] = useState("")
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [availableCourses, setAvailableCourses] = useState([])
  const [fetchingCourses, setFetchingCourses] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        // Fetch user data to get department
        try {
          const userDoc = await getDoc(doc(db, "users", u.uid))
          if (userDoc.exists()) {
            setDepartment(userDoc.data().department || "")
          }
        } catch (err) {
          console.error("Error fetching user data:", err)
          toast.error("Failed to load user information")
        }
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const fetchCourses = async () => {
      setFetchingCourses(true)
      try {
        const videosSnapshot = await getDocs(collection(db, "videos"))
        const courses = new Set()
        
        videosSnapshot.forEach(doc => {
          const data = doc.data()
          if (data.courseName) {
            courses.add(data.courseName)
          }
        })
        
        setAvailableCourses(Array.from(courses).sort())
      } catch (err) {
        console.error("Error fetching courses:", err)
        toast.error("Failed to load available courses")
      } finally {
        setFetchingCourses(false)
      }
    }
    
    fetchCourses()
  }, [])

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f) {
      setFile(f)
      // infer extension
      setFileType(f.name.split(".").pop().toLowerCase())
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error("Log in first")
      return
    }
    if (!file) {
      toast.error("Select a file")
      return
    }
    if (!courseName) {
      toast.error("Please select a course")
      return
    }

    setLoading(true)
    const storage = getStorage()
    const path = `materials/${user.uid}/${Date.now()}_${file.name}`
    const ref = storageRef(storage, path)
    const uploadTask = uploadBytesResumable(ref, file)

    uploadTask.on(
      "state_changed",
      (snap) => {
        const pct = Math.round(
          (snap.bytesTransferred / snap.totalBytes) * 100
        )
        setProgress(pct)
      },
      (err) => {
        toast.error("Upload failed: " + err.message)
        setLoading(false)
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref)
        await addDoc(collection(db, "learningMaterials"), {
          title,
          courseName,
          department,
          description,
          url,
          fileType,
          uploadedBy: user.uid,
          createdAt: serverTimestamp(),
          rating: 0,
          read: false,
        })
        toast.success("Material added!")
        setLoading(false)
        navigate("/materials")
      }
    )
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <img src={Logo} alt="Logo" className="h-12 mb-4" />
          <h1 className="text-2xl font-semibold mb-4">Upload Learning Material</h1>
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
            <label className="block mb-1 font-medium">Course Name</label>
            <select
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a course</option>
              {fetchingCourses ? (
                <option disabled>Loading courses...</option>
              ) : (
                availableCourses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Department</label>
            <input
              type="text"
              value={department}
              readOnly
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Select File
            </label>
            <input
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={handleFileChange}
              required
              className="block"
            />
          </div>
          {progress > 0 && (
            <div className="text-sm text-blue-600">
              Uploading: {progress}%
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600"
          >
            {loading ? "Uploading…" : "Upload Material"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddMaterial