// src/pages/LearningMaterials.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Logo from "../assets/images/logo2.png";
import { db, auth } from "../config/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { format } from "date-fns";

const LearningMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedMaterials, setCompletedMaterials] = useState([]);
  const navigate = useNavigate();

  // Fetch user role and completed materials
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        // Get user role
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }

        // Get completed materials for employee
        if (userDoc.data()?.role === "Employee") {
          const trainingPathDoc = await getDoc(
            doc(db, "trainingPaths", auth.currentUser.uid)
          );
          if (trainingPathDoc.exists()) {
            setCompletedMaterials(trainingPathDoc.data().completedMaterials || []);
          }
        }
      }
    };
    fetchUserData();
  }, []);

  // Fetch materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const q = query(
          collection(db, "learningMaterials"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setMaterials(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            rating: d.data().rating || 0,
          }))
        );
      } catch (error) {
        console.error("Error fetching materials:", error);
        toast.error("Failed to load materials");
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  // Update training path when material is marked as completed
  const updateTrainingPath = async (materialId, isCompleted) => {
    if (userRole !== "Employee") return;

    try {
      const trainingPathRef = doc(db, "trainingPaths", auth.currentUser.uid);
      const trainingPathDoc = await getDoc(trainingPathRef);

      let updatedCompletedMaterials = [...completedMaterials];
      
      if (isCompleted) {
        // Add to completed if not already there
        if (!updatedCompletedMaterials.includes(materialId)) {
          updatedCompletedMaterials.push(materialId);
        }
      } else {
        // Remove from completed
        updatedCompletedMaterials = updatedCompletedMaterials.filter(
          (id) => id !== materialId
        );
      }

      await setDoc(
        trainingPathRef,
        {
          userId: auth.currentUser.uid,
          completedMaterials: updatedCompletedMaterials,
          lastUpdated: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        },
        { merge: true }
      );

      setCompletedMaterials(updatedCompletedMaterials);
      toast.success(isCompleted ? "Material marked as completed" : "Material marked as incomplete");
    } catch (error) {
      console.error("Error updating training path:", error);
      toast.error("Failed to update training progress");
    }
  };

  // Update star rating
  const handleRatingChange = async (id, newRating) => {
    try {
      const ref = doc(db, "learningMaterials", id);
      await updateDoc(ref, { rating: newRating });
      setMaterials((prev) =>
        prev.map((m) => (m.id === id ? { ...m, rating: newRating } : m))
      );
      toast.success("Rating updated");
    } catch (error) {
      console.error("Error updating rating:", error);
      toast.error("Failed to update rating");
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await deleteDoc(doc(db, "learningMaterials", id));
        setMaterials(materials.filter((material) => material.id !== id));
        toast.success("Material deleted successfully");
      } catch (error) {
        console.error("Error deleting material:", error);
        toast.error("Failed to delete material");
      }
    }
  };

  const StarRating = ({ id, rating }) => (
    <div className="flex items-center mt-2">
      <span className="mr-2 text-sm text-gray-600">Rating:</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleRatingChange(id, star)}
          className="focus:outline-none hover:scale-110 transition-transform"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill={star <= rating ? "gold" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      ))}
    </div>
  );

  const CompletionBadge = ({ isCompleted }) => (
    <span
      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
        isCompleted
          ? "bg-green-100 text-green-800"
          : "bg-yellow-100 text-yellow-800"
      }`}
    >
      {isCompleted ? "✓ Completed" : "Pending"}
    </span>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <img src={Logo} alt="Logo" className="h-10 mr-4" />
              <h1 className="text-2xl font-bold text-gray-800">
                Learning Materials
              </h1>
            </div>
            {userRole === "Educator" && (
              <button
                onClick={() => navigate("/add-material")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Material
              </button>
            )}
          </div>
          <p className="text-gray-600">
            {userRole === "Educator"
              ? "Manage and share learning resources with your team"
              : "Access and complete your assigned learning materials"}
          </p>
        </div>

        <div className="space-y-6">
          {materials.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="font-semibold text-lg text-gray-800">
                    {m.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(m.createdAt?.seconds * 1000), "MMMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {userRole === "Employee" && (
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        checked={completedMaterials.includes(m.id)}
                        onChange={(e) =>
                          updateTrainingPath(m.id, e.target.checked)
                        }
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Mark as completed
                      </span>
                    </label>
                  )}
                  {userRole === "Educator" && (
                    <button
                      onClick={() => handleDeleteMaterial(m.id)}
                      className="text-red-600 hover:text-red-800 p-1 transition-colors"
                      title="Delete Material"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{m.description}</p>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <a
                    href={m.url}
                    download
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Download {m.fileType?.toUpperCase()}
                  </a>
                  {userRole === "Employee" && (
                    <CompletionBadge isCompleted={completedMaterials.includes(m.id)} />
                  )}
                </div>
                <StarRating id={m.id} rating={m.rating} />
              </div>
            </div>
          ))}

          {materials.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No learning materials available
              </h3>
              <p className="mt-2 text-gray-500">
                {userRole === "Educator"
                  ? "Get started by uploading your first learning material"
                  : "Check back later for new materials"}
              </p>
              {userRole === "Educator" && (
                <button
                  onClick={() => navigate("/add-material")}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Upload Material
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningMaterials;