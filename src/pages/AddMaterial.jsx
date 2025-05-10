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
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { toast } from "react-toastify"

const AddMaterial = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState(null)
  const [fileType, setFileType] = useState("")
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
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
