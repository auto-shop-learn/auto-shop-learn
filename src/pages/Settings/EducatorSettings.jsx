import { useState, useEffect } from "react";
import { db, auth } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const EducatorSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    gradingPreferences: {
      defaultGradingScale: "percentage",
      allowLateSubmissions: true,
      lateSubmissionPenalty: 10,
      autoGradeQuizzes: true,
      showAnswersAfterSubmission: true
    },
    courseManagement: {
      defaultCourseVisibility: "private",
      allowStudentEnrollment: true,
      requireApproval: true,
      maxStudentsPerCourse: 30,
      enableDiscussion: true
    },
    notifications: {
      newEnrollments: true,
      assignmentSubmissions: true,
      studentQuestions: true,
      courseAnnouncements: true
    },
    assessmentSettings: {
      defaultQuizTimeLimit: 30,
      allowRetakes: true,
      maxRetakes: 2,
      randomizeQuestions: true,
      showProgress: true
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.educatorSettings) {
              setSettings(data.educatorSettings);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching educator settings:", error);
        toast.error("Failed to load educator settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        educatorSettings: settings,
        updatedAt: new Date()
      });

      toast.success("Educator settings updated successfully");
    } catch (error) {
      console.error("Error updating educator settings:", error);
      toast.error("Failed to update educator settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Educator Settings</h2>

      <div className="space-y-8">
        {/* Grading Preferences */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Grading Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Grading Scale
              </label>
              <select
                value={settings.gradingPreferences.defaultGradingScale}
                onChange={(e) => handleChange("gradingPreferences", "defaultGradingScale", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="percentage">Percentage</option>
                <option value="letter">Letter Grade</option>
                <option value="points">Points</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-700">Allow Late Submissions</label>
              <button
                onClick={() => handleChange("gradingPreferences", "allowLateSubmissions", !settings.gradingPreferences.allowLateSubmissions)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.gradingPreferences.allowLateSubmissions ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.gradingPreferences.allowLateSubmissions ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {settings.gradingPreferences.allowLateSubmissions && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Late Submission Penalty (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.gradingPreferences.lateSubmissionPenalty}
                  onChange={(e) => handleChange("gradingPreferences", "lateSubmissionPenalty", parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="text-gray-700">Auto-grade Quizzes</label>
              <button
                onClick={() => handleChange("gradingPreferences", "autoGradeQuizzes", !settings.gradingPreferences.autoGradeQuizzes)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.gradingPreferences.autoGradeQuizzes ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.gradingPreferences.autoGradeQuizzes ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-700">Show Answers After Submission</label>
              <button
                onClick={() => handleChange("gradingPreferences", "showAnswersAfterSubmission", !settings.gradingPreferences.showAnswersAfterSubmission)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.gradingPreferences.showAnswersAfterSubmission ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.gradingPreferences.showAnswersAfterSubmission ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Course Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Course Management</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Course Visibility
              </label>
              <select
                value={settings.courseManagement.defaultCourseVisibility}
                onChange={(e) => handleChange("courseManagement", "defaultCourseVisibility", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-700">Allow Student Enrollment</label>
              <button
                onClick={() => handleChange("courseManagement", "allowStudentEnrollment", !settings.courseManagement.allowStudentEnrollment)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.courseManagement.allowStudentEnrollment ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.courseManagement.allowStudentEnrollment ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-700">Require Approval</label>
              <button
                onClick={() => handleChange("courseManagement", "requireApproval", !settings.courseManagement.requireApproval)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.courseManagement.requireApproval ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.courseManagement.requireApproval ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Students per Course
              </label>
              <input
                type="number"
                min="1"
                value={settings.courseManagement.maxStudentsPerCourse}
                onChange={(e) => handleChange("courseManagement", "maxStudentsPerCourse", parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-700">Enable Discussion</label>
              <button
                onClick={() => handleChange("courseManagement", "enableDiscussion", !settings.courseManagement.enableDiscussion)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.courseManagement.enableDiscussion ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.courseManagement.enableDiscussion ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Assessment Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Assessment Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Quiz Time Limit (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={settings.assessmentSettings.defaultQuizTimeLimit}
                onChange={(e) => handleChange("assessmentSettings", "defaultQuizTimeLimit", parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-700">Allow Quiz Retakes</label>
              <button
                onClick={() => handleChange("assessmentSettings", "allowRetakes", !settings.assessmentSettings.allowRetakes)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.assessmentSettings.allowRetakes ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.assessmentSettings.allowRetakes ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {settings.assessmentSettings.allowRetakes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Retakes
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.assessmentSettings.maxRetakes}
                  onChange={(e) => handleChange("assessmentSettings", "maxRetakes", parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="text-gray-700">Randomize Questions</label>
              <button
                onClick={() => handleChange("assessmentSettings", "randomizeQuestions", !settings.assessmentSettings.randomizeQuestions)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.assessmentSettings.randomizeQuestions ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.assessmentSettings.randomizeQuestions ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-700">Show Progress</label>
              <button
                onClick={() => handleChange("assessmentSettings", "showProgress", !settings.assessmentSettings.showProgress)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.assessmentSettings.showProgress ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.assessmentSettings.showProgress ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EducatorSettings; 