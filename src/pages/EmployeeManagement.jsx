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
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "../components/Sidebar";
import Logo from "../assets/images/logo2.png";
import { toast } from "react-toastify";

const EmployeeManagement = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedProgress, setSelectedProgress] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // Track authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({
            ...user,
            role: userData.role,
            department: userData.department
          });
          
          // If user is educator, set their department for filtering
          if (userData.role === "Educator") {
            setSelectedDepartment(userData.department);
          }
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch employees and their data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (!currentUser) return; // Wait until we know the user state
        
        setLoading(true);
        
        // Base query for employees
        let employeesQuery = query(
          collection(db, "users"),
          where("role", "==", "Employee"),
          orderBy("name")
        );

        // If current user is an educator, filter by their department
        if (currentUser?.role === "Educator" && currentUser?.department) {
          employeesQuery = query(
            employeesQuery,
            where("department", "==", currentUser.department)
          );
        }
        
        const employeesSnapshot = await getDocs(employeesQuery);
        
        // Get unique departments and positions
        const departmentsSet = new Set();
        const positionsSet = new Set();
        
        const employeesData = await Promise.all(
          employeesSnapshot.docs.map(async (employeeDoc) => {
            const employeeData = employeeDoc.data();
            departmentsSet.add(employeeData.department);
            positionsSet.add(employeeData.position);
            
            // Get employee's training progress from multiple collections
            const [progressDoc, certificatesSnapshot, gradesSnapshot] = await Promise.all([
              getDoc(doc(db, "userProgress", employeeDoc.id)),
              getDocs(query(
                collection(db, "certificates"),
                where("employeeId", "==", employeeDoc.id)
              )),
              getDocs(query(
                collection(db, "grades"),
                where("userId", "==", employeeDoc.id)
              ))
            ]);
            
            const progressData = progressDoc.exists() ? progressDoc.data() : {
              completedVideos: [],
              videoProgress: {},
              lastActivity: null,
              startDate: null
            };
            
            // Calculate average score
            let totalScore = 0;
            let gradeCount = 0;
            gradesSnapshot.forEach(gradeDoc => {
              const grade = gradeDoc.data().score;
              if (grade) {
                totalScore += grade;
                gradeCount++;
              }
            });
            const averageScore = gradeCount > 0 ? Math.round((totalScore / gradeCount) * 100) / 100 : 0;
            
            return {
              id: employeeDoc.id,
              ...employeeData,
              progress: progressData,
              certificates: certificatesSnapshot.size,
              averageScore
            };
          })
        );
        
        setEmployees(employeesData);
        setFilteredEmployees(employeesData);
        setDepartments(Array.from(departmentsSet));
        setPositions(Array.from(positionsSet));
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [currentUser]);

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

    // Filter by department (only for admins)
    if (selectedDepartment !== "all" && currentUser?.role !== "Educator") {
      filtered = filtered.filter(employee =>
        employee.department === selectedDepartment
      );
    }

    // Filter by position
    if (selectedPosition !== "all") {
      filtered = filtered.filter(employee =>
        employee.position === selectedPosition
      );
    }

    // Filter by training progress
    if (selectedProgress !== "all") {
      filtered = filtered.filter(employee => {
        const completedCount = employee.progress.completedVideos?.length || 0;
        const totalMaterials = 10; // Total required trainings
        const progressPercentage = (completedCount / totalMaterials) * 100;

        switch (selectedProgress) {
          case "beginner":
            return progressPercentage < 30;
          case "intermediate":
            return progressPercentage >= 30 && progressPercentage < 70;
          case "advanced":
            return progressPercentage >= 70;
          case "not-started":
            return completedCount === 0;
          default:
            return true;
        }
      });
    }

    setFilteredEmployees(filtered);
  }, [searchTerm, selectedDepartment, selectedPosition, selectedProgress, employees, currentUser]);

  const calculateProgress = (employee) => {
    const completedCount = employee.progress.completedVideos?.length || 0;
    const totalMaterials = 10; // Total required trainings
    return Math.round((completedCount / totalMaterials) * 100);
  };

  const getProgressColor = (progress) => {
    if (progress >= 70) return "bg-green-100 text-green-800";
    if (progress >= 30) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getProgressLabel = (progress) => {
    if (progress >= 70) return "Advanced";
    if (progress >= 30) return "Intermediate";
    if (progress > 0) return "Beginner";
    return "Not Started";
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
          
          {/* Filters and Search */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded"
            />
            
            {currentUser?.role !== "Educator" && (
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="all">All Departments</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            )}
            
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">All Positions</option>
              {positions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
            
            <select
              value={selectedProgress}
              onChange={(e) => setSelectedProgress(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">All Progress Levels</option>
              <option value="not-started">Not Started</option>
              <option value="beginner">Beginner (0-30%)</option>
              <option value="intermediate">Intermediate (30-70%)</option>
              <option value="advanced">Advanced (70-100%)</option>
            </select>
          </div>
          
          <div className="text-right mb-4">
            <span className="text-sm text-gray-500">
              Showing {filteredEmployees.length} of {employees.length} employees
            </span>
            {currentUser?.role === "Educator" && (
              <p className="text-sm text-gray-500">Department: {currentUser.department}</p>
            )}
          </div>
        </div>

        {/* Employee List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => {
            const progress = calculateProgress(employee);
            const progressLabel = getProgressLabel(progress);
            
            return (
              <div
                key={employee.id}
                onClick={() => handleEmployeeClick(employee)}
                className="border p-4 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="font-medium text-lg">{employee.name}</h2>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {employee.department}
                  </span>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Training Progress</span>
                    <span className={`text-xs px-2 py-1 rounded ${getProgressColor(progress)}`}>
                      {progressLabel}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
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
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{progress}% Complete</span>
                    <span>{employee.progress.completedVideos?.length || 0}/10 Trainings</span>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Avg. Score</p>
                    <p className="font-medium">{employee.averageScore}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Certificates</p>
                    <p className="font-medium">{employee.certificates}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Employee Profile Modal */}
        {showProfile && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedEmployee.name}</h2>
                  <p className="text-gray-600">{selectedEmployee.position} • {selectedEmployee.department}</p>
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Personal Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Personal Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Position</p>
                      <p className="font-medium">{selectedEmployee.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{selectedEmployee.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Employee ID</p>
                      <p className="font-mono text-sm">{selectedEmployee.id}</p>
                    </div>
                  </div>
                </div>

                {/* Training Overview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Training Overview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm font-medium">
                          {calculateProgress(selectedEmployee)}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            calculateProgress(selectedEmployee) >= 70
                              ? "bg-green-600"
                              : calculateProgress(selectedEmployee) >= 30
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${calculateProgress(selectedEmployee)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedEmployee.progress.completedVideos?.length || 0} of 10 trainings completed
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Average Score</p>
                        <p className="text-xl font-bold">
                          {selectedEmployee.averageScore}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Certificates</p>
                        <p className="text-xl font-bold">
                          {selectedEmployee.certificates}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Category */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Performance</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Progress Level</p>
                      <p className={`text-lg font-medium px-3 py-1 rounded-full inline-block ${getProgressColor(calculateProgress(selectedEmployee))}`}>
                        {getProgressLabel(calculateProgress(selectedEmployee))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Activity</p>
                      <p className="font-medium">
                        {selectedEmployee.progress.lastActivity
                          ? new Date(selectedEmployee.progress.lastActivity).toLocaleDateString()
                          : "No recent activity"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Training Started</p>
                      <p className="font-medium">
                        {selectedEmployee.progress.startDate
                          ? new Date(selectedEmployee.progress.startDate).toLocaleDateString()
                          : "Not started"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Progress Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Completed Trainings */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Completed Trainings</h3>
                  {selectedEmployee.progress.completedVideos?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEmployee.progress.completedVideos.map((videoId, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                          <div className="flex justify-between">
                            <span className="font-medium">Training #{index + 1}</span>
                            <span className="text-sm text-green-600">Completed</span>
                          </div>
                          <p className="text-sm text-gray-500">ID: {videoId}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No trainings completed yet</p>
                  )}
                </div>

                {/* In Progress Trainings */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">In Progress</h3>
                  {selectedEmployee.progress.videoProgress && Object.keys(selectedEmployee.progress.videoProgress).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(selectedEmployee.progress.videoProgress).map(([videoId, progress]) => (
                        <div key={videoId} className="bg-gray-50 p-3 rounded-lg border">
                          <div className="flex justify-between">
                            <span className="font-medium">Training {videoId}</span>
                            <span className="text-sm text-yellow-600">
                              {Math.round(progress * 100)}% Complete
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-yellow-500 h-1.5 rounded-full"
                              style={{ width: `${progress * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No trainings in progress</p>
                  )}
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