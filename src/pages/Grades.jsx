import { useState, useEffect } from "react"
import { db, auth } from "../config/firebase"
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore"
import Sidebar from "../components/Sidebar"
import ExtLinkIcon from "../assets/svg/extLinkIcon.svg?react"
import DeleteIcon from "../assets/svg/deleteIcon.svg?react"
import EditIcon from "../assets/svg/editIcon.svg?react"
// import Logo from "../assets/svg/logo.svg"
import Logo from "../assets/images/logo2.png";
import { format } from "date-fns"
import { Link } from "react-router-dom"

const Grades = () => {
  const [gradesList, setGradesList] = useState([])

  const gradesCollectionRef = collection(db, "animals")

  const getGradesList = async () => {
    try {
      const data = await getDocs(gradesCollectionRef)
      const mapped = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
      setGradesList(mapped)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getGradesList()
  }, [])

  const deleteGrade = async (id) => {
    const gradeDoc = doc(db, "animals", id)
    await deleteDoc(gradeDoc)
    getGradesList()
  }

  const handleDownload = () => {
    if (!gradesList.length) return
    // Build CSV header
    const header = ["Student Name", "Grade"].join(",")
    // Build rows
    const rows = gradesList.map(({ type, color }) => [type, color].join(","))
    const csvContent = [header, ...rows].join("\n")
    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `grades_${new Date().toISOString()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="logo mt-3 mb-6">
        <img src={Logo} alt="Your Logo" width="300px" />
      </div>
      <div className="flex">
        <Sidebar />
        <div className="container mx-auto py-4">
          <div className="flex items-center space-x-4">
            <Link to="/add-animal">
              <button className="p-2 bg-blue-700 text-white rounded hover:bg-blue-800">
                + Add Grade
              </button>
            </Link>
            <button
              onClick={handleDownload}
              className="p-2 bg-blue-400 text-white rounded hover:bg-blue-500"
            >
              Download CSV
            </button>
          </div>
          <div className="mt-2">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-red-200">
                  <th className="p-0.5 border border-gray-300 w-1/6">
                    Student Name
                  </th>
                  <th className="p-0.5 border border-gray-300 w-1/6">Grade</th>
                  <th className="p-0.5 border border-gray-300 w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {gradesList.map((entry) => (
                  <tr key={entry.id}>
                    <td className="p-0.5 border border-gray-300">
                      {entry.type}
                    </td>
                    <td className="p-0.5 border border-gray-300">
                      {entry.color}
                    </td>
                    <td className="p-0.5 border border-gray-300 flex space-x-2">
                      <div onClick={() => deleteGrade(entry.id)}>
                        <DeleteIcon fill="#ffffff" width="20px" height="20px" />
                      </div>
                      <div>
                        <EditIcon fill="#ffffff" width="20px" height="20px" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default Grades
