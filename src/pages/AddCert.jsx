// src/pages/AddCert.jsx
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Logo from "../assets/images/logo2.png"
import { auth, db } from "../config/firebase"
import {
  getStorage,
  ref as storageRef,
  uploadString,
  getDownloadURL,
} from "firebase/storage"
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { toast } from "react-toastify"
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const AddCert = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [userName, setUserName] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("Official Training Completion Certificate")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [certDate] = useState(new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }))
  
  const certificateRef = useRef(null)

  // Fetch user data and set states
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        
        // Fetch user's name from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUserName(userData.name || "")
            // Set a default title based on the user's name
            setTitle(`${userData.name || "Employee"} Training Certificate`)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          toast.error("Could not fetch user information")
        }
      } else {
        navigate("/login")
      }
    })
    return () => unsubscribe()
  }, [navigate])

  const generatePDF = async () => {
    if (!certificateRef.current) return

    try {
      // Capture the certificate div as an image
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false
      })
      
      // Convert to PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })
      
      const imgWidth = 297 // A4 width in landscape (mm)
      const imgHeight = canvas.height * imgWidth / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      
      return {
        pdfBlob: pdf.output('blob'),
        pdfBase64: pdf.output('datauristring')
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      throw error
    }
  }

  const saveCertificate = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error("Please sign in to generate a certificate")
      return
    }
    
    if (!userName) {
      toast.error("Could not find your name. Please update your profile.")
      return
    }
    
    setLoading(true)
    setProgress(10)
    
    try {
      // Generate the PDF
      const { pdfBase64, pdfBlob } = await generatePDF()
      setProgress(40)
      
      // Upload to Firebase Storage
      const storage = getStorage()
      const path = `certificates/${user.uid}/${Date.now()}_certificate.pdf`
      const certRef = storageRef(storage, path)
      
      // Upload the base64 string (remove the data:application/pdf;base64, prefix)
      const base64Content = pdfBase64.split(',')[1]
      
      // Upload to Firebase Storage
      const uploadTask = uploadString(certRef, base64Content, 'base64', {
        contentType: 'application/pdf'
      })
      
      setProgress(70)
      
      // Get the download URL
      const url = await getDownloadURL(await uploadTask)
      
      // Save certificate info to Firestore
      await addDoc(collection(db, "certificates"), {
        title,
        description,
        url,
        uploadedBy: user.uid,
        userName: userName,
        createdAt: serverTimestamp(),
        downloaded: false,
      })
      
      setProgress(100)
      toast.success("Certificate generated successfully!")
      navigate("/certificates")
    } catch (error) {
      console.error("Error generating certificate:", error)
      toast.error("Failed to generate certificate: " + error.message)
    } finally {
      setLoading(false)
    }
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
            Generate Certificate
          </h1>
          
          {/* Certificate Preview */}
          <div className="mb-8 p-4 border rounded">
            <h2 className="font-semibold mb-2">Certificate Preview</h2>
            <div 
              ref={certificateRef} 
              className="certificate-container bg-white border-8 border-blue-800 p-8 text-center"
              style={{ width: '100%', height: 'auto', aspectRatio: '1.414/1' }}
            >
              <div className="border-4 border-blue-700 p-6 h-full flex flex-col justify-between">
                <div className="cert-header mb-4">
                  <h1 className="text-3xl font-bold text-blue-900">CERTIFICATE OF ACHIEVEMENT</h1>
                  <div className="text-lg text-blue-700 mt-2">Training & Development Program</div>
                </div>
                
                <div className="cert-body flex-grow flex flex-col justify-center">
                  <div className="text-lg mb-2">This certifies that</div>
                  <div className="name text-3xl font-bold text-blue-800 my-3">{userName || "Employee Name"}</div>
                  <div className="text-lg mb-4">has successfully completed the required training for</div>
                  <div className="text-2xl font-semibold my-3">{title || "Training Certificate"}</div>
                  <div className="text-md mt-3">Issued on {certDate}</div>
                </div>
                
                <div className="cert-footer mt-6 flex justify-between items-end">
                  <div className="signature text-left">
                    <div className="border-t border-black inline-block w-32"></div>
                    <div className="text-sm">Training Director</div>
                  </div>
                  <div className="company-seal flex items-center justify-center">
                    <div className="border-2 border-blue-700 rounded-full p-2 w-24 h-24 flex items-center justify-center">
                      <div className="text-xs text-blue-800">OFFICIAL SEAL</div>
                    </div>
                  </div>
                  <div className="signature text-right">
                    <div className="border-t border-black inline-block w-32"></div>
                    <div className="text-sm">CEO</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={saveCertificate} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Certificate Title</label>
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
            
            {progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
                <div className="text-sm text-blue-600 mt-1">
                  Generating: {progress}%
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600"
            >
              {loading ? "Generating..." : "Generate Certificate"}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default AddCert