import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Logo from "../assets/images/logo2.png";
import { db, auth } from "../config/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  setDoc,
  arrayUnion,
  getDoc,
  serverTimestamp,
  addDoc,
  increment
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";

const Videos = () => {
  const [courses, setCourses] = useState([]);
  const [videos, setVideos] = useState([]);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userDepartment, setUserDepartment] = useState(null);
  const [userProgress, setUserProgress] = useState({
    completedVideos: [],
    videoProgress: {},
    allVideosCompleted: false,
    certificateGenerated: false,
  });
  const [loading, setLoading] = useState(true);
  const [showCertificateButton, setShowCertificateButton] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const videoRefs = useRef({});
  const navigate = useNavigate();

  // Certificate generation function
  const generateCertificate = async () => {
    try {
      // Get all completed video titles
      const completedVideoTitles = videos
        .filter(video => userProgress.completedVideos.includes(video.id))
        .map(video => video.title);

      // Create certificate data
      const certificateData = {
        employeeId: user.uid,
        employeeName: user.displayName || "Employee",
        completedVideos: userProgress.completedVideos,
        videoTitles: completedVideoTitles,
        completionDate: serverTimestamp(),
        status: "issued",
        certificateUrl: "",
        verificationCode: `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        department: userDepartment,
      };

      // Add to certificates collection
      const certRef = await addDoc(collection(db, "certificates"), certificateData);
      
      // Update user's progress
      const progressRef = doc(db, "userProgress", user.uid);
      await updateDoc(progressRef, {
        certificateId: certRef.id,
        certificateGenerated: true
      });

      // Update local state
      setUserProgress(prev => ({
        ...prev,
        certificateGenerated: true
      }));

      toast.success("Certificate generated for completing all training videos!");
      return certRef.id;
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("Failed to generate certificate");
      return null;
    }
  };

  // Fetch user data and initialize progress tracking
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
          setUserDepartment(userDoc.data().department);
          
          if (userDoc.data().role === "Employee") {
            await initializeUserProgress(currentUser.uid);
          }
        }
      }
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Initialize user progress document
  const initializeUserProgress = async (userId) => {
    const progressRef = doc(db, "userProgress", userId);
    const progressSnap = await getDoc(progressRef);

    if (!progressSnap.exists()) {
      await setDoc(progressRef, {
        completedVideos: [],
        videoProgress: {},
        allVideosCompleted: false,
        certificateGenerated: false,
      });
    }

    const progressData = progressSnap.data() || {
      completedVideos: [],
      videoProgress: {},
      allVideosCompleted: false,
      certificateGenerated: false,
    };

    setUserProgress(progressData);
    
    // Show certificate button if applicable
    if (progressData.allVideosCompleted && !progressData.certificateGenerated) {
      setShowCertificateButton(true);
    }
  };

  // Fetch all courses and videos
  useEffect(() => {
    const fetchData = async () => {
      if (!userDepartment && userRole !== "Educator") return;

      try {
        // Fetch courses based on user's department (for employees) or all courses (for educators)
        let coursesQuery;
        if (userRole === "Employee") {
          coursesQuery = query(
            collection(db, "courses"),
            where("department", "==", userDepartment)
          );
        } else {
          coursesQuery = query(collection(db, "courses"));
        }

        const coursesSnap = await getDocs(coursesQuery);
        const coursesData = coursesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesData);

        // Fetch videos for these courses
        if (coursesData.length > 0) {
          const videoIds = coursesData.flatMap(course => course.videos || []);
          if (videoIds.length > 0) {
            const videosQuery = query(
              collection(db, "videos"),
              where("__name__", "in", videoIds)
            );
            const videosSnap = await getDocs(videosQuery);
            const videosData = videosSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setVideos(videosData);
          }
        }

        // Check completion status after videos load
        if (user && userRole === "Employee") {
          await checkAllVideosCompleted();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user, userRole, userDepartment]);

  // Check if all videos are completed
  const checkAllVideosCompleted = async () => {
    if (userRole !== "Employee" || videos.length === 0) return false;
    
    const progressRef = doc(db, "userProgress", user.uid);
    const progressSnap = await getDoc(progressRef);
    const completedVideos = progressSnap.data()?.completedVideos || [];
    
    const allVideoIds = videos.map(video => video.id);
    const allCompleted = allVideoIds.every(id => completedVideos.includes(id));
    
    if (allCompleted && !progressSnap.data()?.allVideosCompleted) {
      await updateDoc(progressRef, {
        allVideosCompleted: true,
        completedAt: serverTimestamp(),
      });
      
      setUserProgress(prev => ({
        ...prev,
        allVideosCompleted: true
      }));
      
      if (!progressSnap.data()?.certificateGenerated) {
        setShowCertificateButton(true);
      }
      
      toast.success("Congratulations! You've completed all training videos!");
    }
    
    return allCompleted;
  };

  // Update video progress
  const updateVideoProgress = async (videoId, progress) => {
    if (userRole !== "Employee") return;

    try {
      const progressRef = doc(db, "userProgress", user.uid);
      await updateDoc(progressRef, {
        [`videoProgress.${videoId}`]: progress,
      });

      setUserProgress((prev) => ({
        ...prev,
        videoProgress: {
          ...prev.videoProgress,
          [videoId]: progress,
        },
      }));

      if (progress >= 0.95 && !userProgress.completedVideos?.includes(videoId)) {
        await markVideoAsCompleted(videoId);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  // Mark video as completed
  const markVideoAsCompleted = async (videoId) => {
    try {
      const progressRef = doc(db, "userProgress", user.uid);
      await updateDoc(progressRef, {
        completedVideos: arrayUnion(videoId),
      });

      setUserProgress((prev) => ({
        ...prev,
        completedVideos: [...(prev.completedVideos || []), videoId],
      }));

      // Check if all videos are now completed
      await checkAllVideosCompleted();

      toast.success("Video marked as completed!");
    } catch (error) {
      console.error("Error marking video as completed:", error);
    }
  };

  // Handle certificate generation
  const handleGenerateCertificate = async () => {
    const certId = await generateCertificate();
    if (certId) {
      setShowCertificateButton(false);
      navigate("/certificates");
    }
  };

  // Toggle fullscreen for video
  const toggleFullscreen = (videoId) => {
    const videoElement = videoRefs.current[videoId];
    if (!videoElement) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    }
  };

  // Star rating component
  const StarRating = ({ videoId, currentRating }) => {
    const handleRating = async (rating) => {
      if (userRole !== "Employee") return;

      try {
        const videoRef = doc(db, "videos", videoId);
        await updateDoc(videoRef, {
          [`ratings.${user?.uid}`]: rating,
        });

        // Update local state
        const updatedVideos = videos.map(video => 
          video.id === videoId 
            ? { ...video, ratings: { ...video.ratings, [user.uid]: rating } }
            : video
        );
        setVideos(updatedVideos);

        toast.success("Rating submitted!");
      } catch (error) {
        console.error("Error submitting rating:", error);
      }
    };

    const ratingValues = currentRating ? Object.values(currentRating) : [];
    const averageRating = ratingValues.length > 0 
      ? (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1)
      : 0;

    return (
      <div className="flex items-center mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            disabled={userRole !== "Employee"}
            className={`${userRole === "Employee" ? "cursor-pointer" : "cursor-default"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill={star <= averageRating ? "gold" : "none"}
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
        <span className="ml-2 text-sm text-gray-500">
          {ratingValues.length} ratings (Avg: {averageRating})
        </span>
      </div>
    );
  };

  const getCourseProgress = (courseId) => {
    if (userRole !== "Employee") return { progress: 0, completed: 0, total: 0 };
    
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.videos) return { progress: 0, completed: 0, total: 0 };
    
    const courseVideos = videos.filter(v => course.videos.includes(v.id));
    const totalVideos = courseVideos.length;
    const completedVideos = courseVideos.filter(v => 
      userProgress.completedVideos?.includes(v.id)
    ).length;
    
    const progress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
    
    return {
      progress,
      completed: completedVideos,
      total: totalVideos,
      allCompleted: completedVideos === totalVideos && totalVideos > 0
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="logo mt-3 mb-6">
          <img src={Logo} alt="Company Logo" width="300px" />
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">
            {selectedCourse ? selectedCourse.name : "Training Courses"}
          </h1>
          {userRole === "Educator" && (
            <button
              onClick={() => navigate("/add-video")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              + Add Video
            </button>
          )}
        </div>

        {userRole === "Employee" && userProgress.allVideosCompleted && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
            <h3 className="font-bold">🎉 Training Complete!</h3>
            <p>You've successfully finished all available training videos.</p>
            {showCertificateButton && (
              <button
                onClick={handleGenerateCertificate}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Generate Completion Certificate
              </button>
            )}
          </div>
        )}

        {!selectedCourse ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const progress = getCourseProgress(course.id);
              return (
                <div 
                  key={course.id} 
                  className="border p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedCourse(course)}
                >
                  <h2 className="font-bold text-lg mb-2">{course.name}</h2>
                  <p className="text-sm text-gray-600 mb-3">
                    {course.department} • {course.videos?.length || 0} videos
                  </p>
                  
                  {userRole === "Employee" && (
                    <>
                      <div className="flex justify-between text-xs mb-1">
                        <span>
                          {progress.completed} of {progress.total} videos completed
                        </span>
                        <span>{Math.round(progress.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            progress.allCompleted ? "bg-green-500" : "bg-blue-600"
                          }`}
                          style={{
                            width: `${progress.progress}%`,
                          }}
                        ></div>
                      </div>
                      {progress.allCompleted && (
                        <div className="mt-2 text-sm text-green-600">
                          ✓ Course completed
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {courses.length === 0 && (
              <div className="text-center py-10 col-span-full">
                <p className="text-gray-500">
                  {userRole === "Employee" 
                    ? "No training courses available for your department yet." 
                    : "No training courses available yet."}
                </p>
                {userRole === "Educator" && (
                  <button
                    onClick={() => navigate("/dashboard/add-video")}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Upload First Video
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Courses
              </button>
              <h2 className="text-xl font-semibold mt-2">{selectedCourse.name}</h2>
              <p className="text-gray-600">{selectedCourse.description || "No description available"}</p>
            </div>

            <div className="space-y-6">
              {videos
                .filter(video => selectedCourse.videos?.includes(video.id))
                .map((video) => (
                  <div key={video.id} className="border p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h2 className="font-bold text-lg">{video.title}</h2>
                        <p className="text-sm text-gray-600">
                          {video.department} • Uploaded by: {video.educatorName}
                        </p>
                      </div>
                      {userRole === "Employee" && 
                        userProgress.completedVideos?.includes(video.id) && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          ✓ Completed
                        </span>
                      )}
                    </div>

                    <div className="mb-3 relative">
                      <video
                        ref={el => videoRefs.current[video.id] = el}
                        src={video.url}
                        controls
                        className="w-full max-w-2xl mx-auto rounded-lg"
                        onTimeUpdate={(e) => {
                          if (userRole === "Employee") {
                            const videoElement = e.target;
                            const progress = videoElement.currentTime / videoElement.duration;
                            updateVideoProgress(video.id, progress);
                          }
                        }}
                      />
                      <button
                        onClick={() => toggleFullscreen(video.id)}
                        className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded"
                        title="Toggle Fullscreen"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a1 1 0 011-1h2V4a1 1 0 011-1h2a1 1 0 011 1v2h2a1 1 0 011 1v2a1 1 0 01-1 1h-2v2a1 1 0 01-1 1H9a1 1 0 01-1-1v-2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    <StarRating
                      videoId={video.id}
                      currentRating={video.ratings || {}}
                    />

                    {userRole === "Employee" && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>
                            {Math.round(
                              (userProgress.videoProgress?.[video.id] || 0) * 100
                            )}% watched
                          </span>
                          {userProgress.completedVideos?.includes(video.id) && (
                            <span className="text-green-600">Completed</span>
                          )}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (userProgress.videoProgress?.[video.id] || 0) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

              {selectedCourse.videos?.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">No videos available in this course yet.</p>
                  {userRole === "Educator" && (
                    <button
                      onClick={() => navigate("/dashboard/add-video")}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      Add Video to Course
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Videos;