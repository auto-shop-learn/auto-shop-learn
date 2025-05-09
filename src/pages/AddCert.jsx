// src/pages/AddCert.jsx
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

const AddCert = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
    })
    return () => unsubscribe()
  }, [])

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) setFile(selected)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!user) return toast.error("Please sign in to upload.")
    if (!file) return toast.error("Please select a PDF file.")

    setLoading(true)
    const storage = getStorage()
    const path = `certificates/${user.uid}/${Date.now()}_${file.name}`
    const ref = storageRef(storage, path)
    const uploadTask = uploadBytesResumable(ref, file)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        )
        setProgress(pct)
      },
      (err) => {
        toast.error("Upload failed: " + err.message)
        setLoading(false)
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          await addDoc(collection(db, "certificates"), {
            title,
            description,
            url,
            uploadedBy: user.uid,
            createdAt: serverTimestamp(),
            downloaded: false,
          })
          toast.success("Certificate uploaded!")
          navigate("/certificates")
        } catch (err) {
          toast.error("Error saving certificate: " + err.message)
        } finally {
          setLoading(false)
        }
      }
    )
  }

  return (
    <>
      <div className="logo my-4">
        <img src={Logo} alt="Logo" width="300px" />
      </div>
      <div className="flex">
        <Sidebar />
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-semibold mb-4">
            Upload Certificate
          </h1>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Select PDF</label>
              <input
                type="file"
                accept="application/pdf"
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
              {loading ? "Uploading…" : "Upload Certificate"}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default AddCert
