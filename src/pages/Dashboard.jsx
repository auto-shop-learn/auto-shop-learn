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
import Sidebar from "../components/Sidebar"; // Import the Sidebar component
import Logo from "../assets/images/logo2.png"; // Import the Logo image


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
    employeesEnrolled: 0 // For Educator
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [trainingMaterials, setTrainingMaterials] = useState([]);
  const [employeeProgress, setEmployeeProgress] = useState([]); // For Educator

  // Handle authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch user data from Firestore
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
        // Common data for all roles
        const materialsQuery = query(
          collection(db, "learningMaterials"),
          orderBy("createdAt", "desc")
        );
        const materialsSnapshot = await getDocs(materialsQuery);
        setTrainingMaterials(materialsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // Role-specific data
        if (userData.role === "Educator") {
          const [usersSnapshot, completionsSnapshot, certificatesSnapshot, gradesSnapshot] = await Promise.all([
            getDocs(collection(db, "users")),
            getDocs(collection(db, "completions")),
            getDocs(collection(db, "certificates")),
            getDocs(collection(db, "grades"))
          ]);

          // Get employee progress data
          const progressData = [];
          const employees = usersSnapshot.docs
            .filter(doc => doc.data().role === "Employee")
            .map(doc => ({ id: doc.id, ...doc.data() }));

          // Calculate average score from grades
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

          for (const employee of employees) {
            const [employeeCompletions, employeeGrades] = await Promise.all([
              getDocs(query(
                collection(db, "completions"),
                where("userId", "==", employee.id)
              )),
              getDocs(query(
                collection(db, "grades"),
                where("userId", "==", employee.id)
              ))
            ]);

            // Calculate employee's average score
            let employeeTotalScore = 0;
            let employeeGradeCount = 0;
            employeeGrades.docs.forEach(doc => {
              const grade = doc.data().score;
              if (grade) {
                employeeTotalScore += grade;
                employeeGradeCount++;
              }
            });
            const employeeAverageScore = employeeGradeCount > 0 ? Math.round((employeeTotalScore / employeeGradeCount) * 100) / 100 : 0;

            progressData.push({
              ...employee,
              completions: employeeCompletions.size,
              averageScore: employeeAverageScore
            });
          }

          setStats({
            totalTrainings: materialsSnapshot.size,
            completedTrainings: completionsSnapshot.size,
            averageScore: averageScore,
            certificatesEarned: certificatesSnapshot.size,
            employeesEnrolled: employees.length
          });
          setEmployeeProgress(progressData);
        } 
        else if (userData.role === "Employee") {
          const [completionsSnapshot, certificatesSnapshot, gradesSnapshot] = await Promise.all([
            getDocs(query(
              collection(db, "completions"),
              where("userId", "==", currentUser.uid)
            )),
            getDocs(query(
              collection(db, "certificates"),
              where("userId", "==", currentUser.uid)
            )),
            getDocs(query(
              collection(db, "grades"),
              where("userId", "==", currentUser.uid)
            ))
          ]);

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

          setStats({
            totalTrainings: materialsSnapshot.size,
            completedTrainings: completionsSnapshot.size,
            averageScore: averageScore,
            certificatesEarned: certificatesSnapshot.size
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
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/sign-in" />;
  }

  if (loading) {
    return <div className="text-center p-8">Loading dashboard data...</div>;
  }

  // Stat Card Component
  const StatCard = ({ title, value, icon, color }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800'
    };

    return (
      <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <span className="text-3xl">{icon}</span>
        </div>
      </div>
    );
  };

  // Training Material Component
  const TrainingMaterial = ({ material }) => {
    return (
      <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-4">
          <h4 className="font-semibold">{material.title}</h4>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{material.description}</p>
          {userData.role === "Employee" && (
            <Link to="/learning-materials" className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 inline-block">
              Start Training
            </Link>
          )}
          {userData.role === "Educator" && (
            <div className="mt-2 flex space-x-2">
              <button className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                Edit
              </button>
              <button className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                Delete
              </button>
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
        <Sidebar />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    );
  };

  // Educator Dashboard View
  if (userData?.role === "Educator") {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <img src={Logo} alt="Logo" className="h-12 mb-4" />
            <h1 className="text-2xl font-semibold mb-4">Educator Dashboard</h1>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Total Training Materials" 
              value={stats.totalTrainings} 
              icon="📋" 
              color="blue" 
            />
            <StatCard 
              title="Completed Videos" 
              value={stats.completedTrainings} 
              icon="✅" 
              color="green" 
            />
            <StatCard 
              title="Avg. Quiz Score" 
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

          {/* Employee Progress */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="font-semibold text-lg mb-4">Employee Progress</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employeeProgress.map(employee => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.name || employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.completions || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.averageScore || 'N/A'}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Training Materials */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Training Materials</h3>
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Upload New Material
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainingMaterials.slice(0, 6).map(material => (
                <TrainingMaterial key={material.id} material={material} />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Employee Dashboard View
  if (userData?.role === "Employee") {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <img src={Logo} alt="Logo" className="h-12 mb-4" />
            <h1 className="text-2xl font-semibold mb-4">My Learning Dashboard</h1>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Total Training Materials" 
              value={stats.totalTrainings} 
              icon="📋" 
              color="blue" 
            />
            <StatCard 
              title="Completed Videos" 
              value={stats.completedTrainings} 
              icon="✅" 
              color="green" 
            />
            <StatCard 
              title="Avg. Quiz Score" 
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
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h3 className="font-semibold text-lg mb-4">Recent Activities</h3>
              <ul className="space-y-3">
                {recentActivities.map(activity => (
                  <li key={activity.id} className="flex items-center">
                    <span className="mr-3 text-2xl">{activity.type === 'quiz' ? '📝' : '🎬'}</span>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.timestamp?.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Available Trainings */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="font-semibold text-lg mb-4">Available Trainings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainingMaterials.map(material => (
                <TrainingMaterial key={material.id} material={material} />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Fallback for unknown roles
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
        <p>Your account doesn't have a recognized role. Please contact support.</p>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;