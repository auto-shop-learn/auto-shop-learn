import { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import Logo from "../assets/images/logo2.png";
import { toast } from "react-toastify";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedProgress, setSelectedProgress] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // Fetch employees and their data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Get all employees
        const employeesQuery = query(
          collection(db, "users"),
          where("role", "==", "Employee"),
          orderBy("name")
        );
        const employeesSnapshot = await getDocs(employeesQuery);
        
        // Get unique departments
        const departmentsSet = new Set();
        const employeesData = await Promise.all(
          employeesSnapshot.docs.map(async (doc) => {
            const employeeData = doc.data();
            departmentsSet.add(employeeData.department);
            
            // Get employee's training progress
            const progressDoc = await getDoc(doc(db, "userProgress", doc.id));
            const progressData = progressDoc.exists() ? progressDoc.data() : {
              completedTrainings: [],
              certificates: [],
              quizScores: []
            };
            
            return {
              id: doc.id,
              ...employeeData,
              progress: progressData
            };
          })
        );
        
        setEmployees(employeesData);
        setFilteredEmployees(employeesData);
        setDepartments(Array.from(departmentsSet));
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Filter employees based on search term and filters
  useEffect(() => {
    let filtered = employees;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by department
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(employee =>
        employee.department === selectedDepartment
      );
    }

    // Filter by training progress
    if (selectedProgress !== "all") {
      filtered = filtered.filter(employee => {
        const completedCount = employee.progress.completedTrainings.length;
        const totalRequired = 10; // Assuming 10 required trainings
        const progressPercentage = (completedCount / totalRequired) * 100;

        switch (selectedProgress) {
          case "beginner":
            return progressPercentage < 30;
          case "intermediate":
            return progressPercentage >= 30 && progressPercentage < 70;
          case "advanced":
            return progressPercentage >= 70;
          default:
            return true;
        }
      });
    }

    setFilteredEmployees(filtered);
  }, [searchTerm, selectedDepartment, selectedProgress, employees]);

  const calculateProgress = (employee) => {
    const completedCount = employee.progress.completedTrainings.length;
    const totalRequired = 10; // Assuming 10 required trainings
    return Math.round((completedCount / totalRequired) * 100);
  };

  const getProgressColor = (progress) => {
    if (progress >= 70) return "text-green-600";
    if (progress >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setShowProfile(true);
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
          <h1 className="text-2xl font-semibold mb-4">Employee Management</h1>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded"
          />
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <select
            value={selectedProgress}
            onChange={(e) => setSelectedProgress(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Progress Levels</option>
            <option value="beginner">Beginner (0-30%)</option>
            <option value="intermediate">Intermediate (30-70%)</option>
            <option value="advanced">Advanced (70-100%)</option>
          </select>
        </div>

        {/* Employee List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => {
            const progress = calculateProgress(employee);
            return (
              <div
                key={employee.id}
                onClick={() => handleEmployeeClick(employee)}
                className="border p-4 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="font-medium">{employee.name}</h2>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {employee.department}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Training Progress</span>
                    <span className={`text-sm font-medium ${getProgressColor(progress)}`}>
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        progress >= 70
                          ? "bg-green-600"
                          : progress >= 30
                          ? "bg-yellow-600"
                          : "bg-red-600"
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Completed Trainings: {employee.progress.completedTrainings.length}</p>
                  <p>Certificates: {employee.progress.certificates.length}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Employee Profile Modal */}
        {showProfile && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{selectedEmployee.name}</h2>
                <button
                  onClick={() => setShowProfile(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-medium text-gray-700">Personal Information</h3>
                  <p className="text-sm text-gray-600">Email: {selectedEmployee.email}</p>
                  <p className="text-sm text-gray-600">Position: {selectedEmployee.position}</p>
                  <p className="text-sm text-gray-600">Department: {selectedEmployee.department}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Training Statistics</h3>
                  <p className="text-sm text-gray-600">
                    Completed Trainings: {selectedEmployee.progress.completedTrainings.length}
                  </p>
                  <p className="text-sm text-gray-600">
                    Certificates: {selectedEmployee.progress.certificates.length}
                  </p>
                  <p className="text-sm text-gray-600">
                    Average Quiz Score:{" "}
                    {selectedEmployee.progress.quizScores.length > 0
                      ? Math.round(
                          selectedEmployee.progress.quizScores.reduce(
                            (a, b) => a + b,
                            0
                          ) / selectedEmployee.progress.quizScores.length
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Completed Trainings</h3>
                <div className="space-y-2">
                  {selectedEmployee.progress.completedTrainings.map((training, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-2 rounded text-sm text-gray-600"
                    >
                      {training.title} - {new Date(training.date).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">Certificates</h3>
                <div className="space-y-2">
                  {selectedEmployee.progress.certificates.map((cert, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-2 rounded text-sm text-gray-600"
                    >
                      {cert.title} - {new Date(cert.issueDate).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement; 