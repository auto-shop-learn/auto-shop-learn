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
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import Logo from "../assets/images/logo2.png";
import { toast } from "react-toastify";

const Grades = () => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newGrade, setNewGrade] = useState({
    subject: "",
    score: "",
    maxScore: "100",
    comments: "",
    date: new Date().toISOString().split("T")[0]
  });

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsQuery = query(collection(db, "users"), where("role", "==", "Employee"));
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudents(studentsData);

        const gradesQuery = query(collection(db, "grades"), orderBy("date", "desc"));
        const gradesSnapshot = await getDocs(gradesQuery);
        const gradesData = gradesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGrades(gradesData);

        const resultsQuery = query(collection(db, "quizResults"));
        const resultsSnapshot = await getDocs(resultsQuery);
        const resultsData = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQuizResults(resultsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <h1 className="text-2xl font-bold mb-4">Student Performance</h1>
          {userRole === "Educator" && (
            <button
              onClick={() => setShowAddGradeModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add New Grade
            </button>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quiz Results</h2>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quiz</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correct Answers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quizResults.map((result) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4">{result.userName || result.userEmail}</td>
                    <td className="px-6 py-4">{result.quizTitle}</td>
                    <td className="px-6 py-4">{result.score} / {result.totalQuestions}</td>
                    <td className="px-6 py-4">{result.correctAnswers}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {result.submittedAt?.seconds
                        ? new Date(result.submittedAt.seconds * 1000).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4 p-6 pb-0">Grades</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grades.map((grade) => (
                <tr key={grade.id}>
                  <td className="px-6 py-4">{students.find(s => s.id === grade.studentId)?.fullName || "Unknown"}</td>
                  <td className="px-6 py-4">{grade.subject}</td>
                  <td className="px-6 py-4">{grade.score}</td>
                  <td className="px-6 py-4">{grade.maxScore}</td>
                  <td className="px-6 py-4">{grade.comments}</td>
                  <td className="px-6 py-4">{grade.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Grades;