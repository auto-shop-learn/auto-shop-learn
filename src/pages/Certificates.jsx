// src/pages/Certificates.jsx
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

const Certificates = () => {
  const [certs, setCerts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCerts = async () => {
      const q = query(
        collection(db, "certificates"),
        orderBy("createdAt", "desc")
      )
      const snap = await getDocs(q)
      setCerts(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          downloaded: d.data().downloaded || false,
        }))
      )
    }
    fetchCerts()
  }, [])

  // toggle the downloaded flag in Firestore and local state
  const toggleDownloaded = async (id, val) => {
    const ref = doc(db, "certificates", id)
    await updateDoc(ref, { downloaded: val })
    setCerts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, downloaded: val } : c))
    )
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <img src={Logo} alt="Logo" className="h-12 mb-4" />
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Certificates</h1>
            <button
              onClick={() => navigate("/add-cert")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Add Certificate
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {certs.map((c) => (
            <div
              key={c.id}
              className="border p-4 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-medium">{c.title}</h2>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={c.downloaded}
                    onChange={(e) =>
                      toggleDownloaded(c.id, e.target.checked)
                    }
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Downloaded
                  </span>
                </label>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                {c.description}
              </p>
              <a
                href={c.url}
                download
                className="text-blue-600 hover:underline"
              >
                Download PDF
              </a>
            </div>
          ))}

          {certs.length === 0 && (
            <p className="text-gray-600">No certificates yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Certificates
