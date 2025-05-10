import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../config/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy, 
  limit,
  doc,
  getDoc
} from "firebase/firestore";
import { Navigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Logo from "../assets/images/logo2.png";

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrainings: 0,
    completedTrainings: 0,
    averageScore: 0,
    certificatesEarned: 0,
    employeesEnrolled: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [trainingMaterials, setTrainingMaterials] = useState([]);
  const [employeeProgress, setEmployeeProgress] = useState([]);
  const [departmentMaterials, setDepartmentMaterials] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Handle authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const fetchDashboardData = async () => {
      if (!currentUser || !userData) return;
      setLoading(true);

      try {
        // Fetch materials specific to the user's department if they're an educator
        let materialsQuery;
        if (userData.role === "Educator" && userData.department) {
          materialsQuery = query(
            collection(db, "learningMaterials"),
            where("department", "==", userData.department),
            orderBy("createdAt", "desc")
          );
        } else {
          materialsQuery = query(
            collection(db, "learningMaterials"),
            orderBy("createdAt", "desc")
          );
        }

        const materialsSnapshot = await getDocs(materialsQuery);
        const materialsData = materialsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrainingMaterials(materialsData);
        setDepartmentMaterials(materialsData.filter(m => m.department === userData.department));

        // Role-specific data
        if (userData.role === "Educator") {
          // Fetch employees in the same department
          const employeesQuery = query(
            collection(db, "users"),
            where("role", "==", "Employee"),
            where("department", "==", userData.department)
          );
          const employeesSnapshot = await getDocs(employeesQuery);
          const employeesData = employeesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setEmployees(employeesData);

          // Fetch all certificates for the department
          const certificatesQuery = query(
            collection(db, "certificates"),
            where("department", "==", userData.department)
          );
          const certificatesSnapshot = await getDocs(certificatesQuery);
          const certificatesData = certificatesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Count unique users who have completed videos
          const completionsQuery = query(
            collection(db, "completions"),
            where("department", "==", userData.department)
          );
          const completionsSnapshot = await getDocs(completionsQuery);
          
          // Calculate department-wide average score
          const gradesQuery = query(
            collection(db, "grades"),
            where("department", "==", userData.department)
          );
          const gradesSnapshot = await getDocs(gradesQuery);

          let totalScore = 0;
          let gradeCount = 0;
          gradesSnapshot.docs.forEach(doc => {
            const grade = doc.data().score;
            if (grade) {
              totalScore += grade;
              gradeCount++;
            }
          });
          const averageScore = gradeCount > 0 ? Math.round((totalScore / gradeCount) * 100) / 100 : 0;

          // Get employee progress data
          const progressData = [];
          
          for (const employee of employeesData) {
            // Check userProgress collection for completion status
            const userProgressDoc = await getDoc(doc(db, "userProgress", employee.id));
            const userProgress = userProgressDoc.exists() ? userProgressDoc.data() : {};
            
            // Get employee certificates
            const employeeCertificates = certificatesData.filter(
              cert => cert.employeeId === employee.id
            );

            // Get employee grades
            const employeeGradesQuery = query(
              collection(db, "grades"),
              where("userId", "==", employee.id)
            );
            const employeeGradesSnapshot = await getDocs(employeeGradesQuery);
            
            // Calculate employee's average score
            let employeeTotalScore = 0;
            let employeeGradeCount = 0;
            employeeGradesSnapshot.docs.forEach(doc => {
              const grade = doc.data().score;
              if (grade) {
                employeeTotalScore += grade;
                employeeGradeCount++;
              }
            });
            const employeeAverageScore = employeeGradeCount > 0 ? 
              Math.round((employeeTotalScore / employeeGradeCount) * 100) / 100 : 0;

            progressData.push({
              ...employee,
              completions: userProgress.completedVideos?.length || 0,
              certificates: employeeCertificates.length,
              averageScore: employeeAverageScore
            });
          }

          setStats({
            totalTrainings: departmentMaterials.length,
            completedTrainings: new Set(completionsSnapshot.docs.map(d => d.data().userId)).size,
            averageScore: averageScore,
            certificatesEarned: certificatesData.length,
            employeesEnrolled: employeesData.length
          });
          setEmployeeProgress(progressData);
        } 
        else if (userData.role === "Employee") {
          // Fetch user's certificates
          const certificatesQuery = query(
            collection(db, "certificates"),
            where("employeeId", "==", currentUser.uid)
          );
          const certificatesSnapshot = await getDocs(certificatesQuery);
          
          // Fetch user's grades
          const gradesQuery = query(
            collection(db, "grades"),
            where("userId", "==", currentUser.uid)
          );
          const gradesSnapshot = await getDocs(gradesQuery);

          // Calculate average score
          let totalScore = 0;
          let gradeCount = 0;
          gradesSnapshot.docs.forEach(doc => {
            const grade = doc.data().score;
            if (grade) {
              totalScore += grade;
              gradeCount++;
            }
          });
          const averageScore = gradeCount > 0 ? Math.round((totalScore / gradeCount) * 100) / 100 : 0;

          // Fetch user progress from userProgress collection
          const userProgressDoc = await getDoc(doc(db, "userProgress", currentUser.uid));
          const progressData = userProgressDoc.exists() ? userProgressDoc.data() : {};

          setStats({
            totalTrainings: materialsData.length,
            completedTrainings: progressData.completedVideos?.length || 0,
            averageScore: averageScore,
            certificatesEarned: certificatesSnapshot.size,
            progress: progressData
          });
        }

        // Recent activities
        const activitiesQuery = query(
          collection(db, "activities"),
          where("userId", "==", currentUser.uid),
          orderBy("timestamp", "desc"),
          limit(5)
        );
        const activitiesSnapshot = await getDocs(activitiesQuery);
        setRecentActivities(activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, userData, authLoading]);

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!currentUser) {
    return <Navigate to="/sign-in" />;
  }

  if (loading) {
    return <div className="text-center p-8">Loading dashboard data...</div>;
  }

  // Stat Card Component - Enhanced with bigger size for employees
  const StatCard = ({ title, value, icon, color }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800'
    };

    const cardSize = userData?.role === "Employee" ? 'p-6' : 'p-4';
    const textSize = userData?.role === "Employee" ? 'text-3xl' : 'text-2xl';

    return (
      <div className={`${cardSize} rounded-lg ${colorClasses[color]} shadow-md hover:shadow-lg transition-shadow`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className={`${textSize} font-bold`}>{value}</p>
          </div>
          <span className="text-4xl">{icon}</span>
        </div>
      </div>
    );
  };

  // Training Material Component - Enhanced with progress tracking
  const TrainingMaterial = ({ material }) => {
    // Check if the material has been completed by the employee
    const isCompleted = userData?.role === "Employee" && 
                       stats.progress?.completedVideos?.includes(material.id);
    
    // Check if the material is in progress
    const progress = userData?.role === "Employee" && 
                     stats.progress?.videoProgress?.[material.id] || 0;

    return (
      <div className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${isCompleted ? 'border-green-200 bg-green-50' : ''}`}>
        <div className="p-4 h-full flex flex-col">
          <h4 className="font-semibold text-lg">{material.title}</h4>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{material.description}</p>
          <p className="text-xs text-gray-500 mt-1">Department: {material.department}</p>
          
          {userData?.role === "Employee" && (
            <>
              {progress > 0 && !isCompleted && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${progress * 100}%` }}
                  ></div>
                </div>
              )}
              {isCompleted ? (
                <span className="mt-2 inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Completed ✓
                </span>
              ) : (
                <Link 
                  to={`/learning-materials?id=${material.id}`}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 inline-block text-center"
                >
                  {progress > 0 ? 'Continue Training' : 'Start Training'}
                </Link>
              )}
            </>
          )}
          
          {userData?.role === "Educator" && (
            <div className="mt-auto pt-3 flex space-x-2">
              
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main Layout with Sidebar
  const DashboardLayout = ({ children }) => {
    return (
      <div className="flex h-screen">
        <Sidebar userRole={userData?.role} department={userData?.department} />
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    );
  };

  // Educator Dashboard View
  if (userData?.role === "Educator") {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <img src={Logo} alt="Logo" className="h-12 mb-4" />
          <h1 className="text-2xl font-semibold mb-2">
            {userData.department} Educator Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your department's training programs
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Department Trainings" 
            value={stats.totalTrainings} 
            icon="📋" 
            color="blue" 
          />
          <StatCard 
            title="Employees Completed" 
            value={stats.completedTrainings} 
            icon="✅" 
            color="green" 
          />
          <StatCard 
             
          />
          <StatCard 
            title="Certificates Issued" 
            value={stats.certificatesEarned} 
            icon="🏆" 
            color="orange" 
          />
        </div>

        {/* Employee Progress Table */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="font-semibold text-lg mb-4">
            Employee Progress ({userData.department})
          </h3>
          {employees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed Materials
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certificates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employeeProgress.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.completions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.certificates}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.averageScore}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No employees found in your department.</p>
          )}
        </div>

        {/* Department Training Materials */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">
              {userData.department} Training Materials
            </h3>
            <Link
              to="/add-material"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upload New Material
            </Link>
          </div>
          {departmentMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentMaterials.map((material) => (
                <TrainingMaterial key={material.id} material={material} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No training materials found for your department.
            </p>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Employee Dashboard View - Enhanced with bigger cards
  if (userData?.role === "Employee") {
    return (
      <DashboardLayout>
        <div className="mb-8">
          <img src={Logo} alt="Logo" className="h-12 mb-4" />
          <h1 className="text-2xl font-semibold mb-2">My Learning Dashboard</h1>
          <p className="text-gray-600">{userData.department} Department</p>
        </div>
        
        {/* Stats Cards - Bigger for employees */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Available Trainings" 
            value={stats.totalTrainings} 
            icon="📋" 
            color="blue" 
          />
          <StatCard 
            title="Completed" 
            value={stats.completedTrainings} 
            icon="✅" 
            color="green" 
          />
          <StatCard 
            title="Avg. Score" 
            value={`${stats.averageScore}%`} 
            icon="📊" 
            color="purple" 
          />
          <StatCard 
            title="Certificates" 
            value={stats.certificatesEarned} 
            icon="🏆" 
            color="orange" 
          />
        </div>

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="font-semibold text-lg mb-4">Recent Activities</h3>
            <ul className="space-y-4">
              {recentActivities.map(activity => (
                <li key={activity.id} className="flex items-start">
                  <span className="mr-4 text-3xl">
                    {activity.type === 'quiz' ? '📝' : '🎬'}
                  </span>
                  <div>
                    <p className="font-medium text-lg">{activity.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp?.seconds * 1000).toLocaleDateString()} - {activity.status}
                      {activity.score && ` - Score: ${activity.score}%`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Available Trainings */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="font-semibold text-lg mb-6">Available Trainings</h3>
          {trainingMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainingMaterials.map(material => (
                <TrainingMaterial key={material.id} material={material} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No training materials available at this time.</p>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Fallback for unknown roles
  return (
    <DashboardLayout>
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Unauthorized Access</h2>
        <p>This dashboard is only available for educators and employees.</p>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;