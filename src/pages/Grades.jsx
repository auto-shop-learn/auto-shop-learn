import { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import Logo from "../assets/images/logo2.png";
import { toast } from "react-toastify";

const Grades = () => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newGrade, setNewGrade] = useState({
    subject: "",
    score: "",
    maxScore: "100",
    comments: "",
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch user role and data
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
    };
    fetchUserData();
  }, []);

  // Fetch students and their grades
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students (users with role "Employee")
        const studentsQuery = query(
          collection(db, "users"),
          where("role", "==", "Employee")
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudents(studentsData);

        // Fetch grades
        const gradesQuery = query(
          collection(db, "grades"),
          orderBy("date", "desc")
        );
        const gradesSnapshot = await getDocs(gradesQuery);
        const gradesData = gradesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGrades(gradesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddGrade = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }

    try {
      const gradeData = {
        ...newGrade,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        educatorId: auth.currentUser.uid,
        educatorName: auth.currentUser.displayName,
        createdAt: serverTimestamp(),
        score: parseFloat(newGrade.score),
        maxScore: parseFloat(newGrade.maxScore)
      };

      await addDoc(collection(db, "grades"), gradeData);
      toast.success("Grade added successfully");
      setShowAddGradeModal(false);
      setNewGrade({
        subject: "",
        score: "",
        maxScore: "100",
        comments: "",
        date: new Date().toISOString().split('T')[0]
      });
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error adding grade:", error);
      toast.error("Failed to add grade");
    }
  };

  const calculateGradePercentage = (score, maxScore) => {
    return ((score / maxScore) * 100).toFixed(1);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <img src={Logo} alt="Logo" className="h-12 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Student Grades</h1>
          
          {userRole === "Educator" && (
            <button
              onClick={() => setShowAddGradeModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add New Grade
            </button>
          )}
        </div>

        {/* Grades Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comments
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grades.map((grade) => {
                const percentage = calculateGradePercentage(grade.score, grade.maxScore);
                return (
                  <tr key={grade.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {grade.studentName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{grade.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {grade.score} / {grade.maxScore}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getGradeColor(percentage)}`}>
                        {percentage}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(grade.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{grade.comments}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Grade Modal */}
        {showAddGradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New Grade</h2>
              <form onSubmit={handleAddGrade}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedStudent?.id || ""}
                    onChange={(e) => {
                      const student = students.find(s => s.id === e.target.value);
                      setSelectedStudent(student);
                    }}
                    required
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newGrade.subject}
                    onChange={(e) => setNewGrade({ ...newGrade, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Score
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={newGrade.score}
                      onChange={(e) => setNewGrade({ ...newGrade, score: e.target.value })}
                      min="0"
                      max={newGrade.maxScore}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Score
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={newGrade.maxScore}
                      onChange={(e) => setNewGrade({ ...newGrade, maxScore: e.target.value })}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded"
                    value={newGrade.date}
                    onChange={(e) => setNewGrade({ ...newGrade, date: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comments
                  </label>
                  <textarea
                    className="w-full p-2 border rounded"
                    value={newGrade.comments}
                    onChange={(e) => setNewGrade({ ...newGrade, comments: e.target.value })}
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddGradeModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Grade
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Grades; 