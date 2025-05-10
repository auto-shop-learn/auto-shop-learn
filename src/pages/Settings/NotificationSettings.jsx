import { useState, useEffect } from "react";
import { db, auth } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const NotificationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: {
      newQuizzes: true,
      quizResults: true,
      certificates: true,
      announcements: true
    },
    inAppNotifications: {
      newQuizzes: true,
      quizResults: true,
      certificates: true,
      announcements: true
    },
    reminderSettings: {
      quizReminders: true,
      courseReminders: true,
      certificateExpiry: true
    }
  });

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.notificationSettings) {
              setNotificationSettings(data.notificationSettings);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching notification settings:", error);
        toast.error("Failed to load notification settings");
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationSettings();
  }, []);

  const handleToggle = (category, setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        notificationSettings,
        updatedAt: new Date()
      });

      toast.success("Notification settings updated successfully");
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast.error("Failed to update notification settings");
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
      <h2 className="text-xl font-bold mb-6">Notification Settings</h2>

      <div className="space-y-8">
        {/* Email Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
          <div className="space-y-4">
            {Object.entries(notificationSettings.emailNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-gray-700">
                  {key.split(/(?=[A-Z])/).join(" ")}
                </label>
                <button
                  onClick={() => handleToggle("emailNotifications", key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    value ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      value ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">In-App Notifications</h3>
          <div className="space-y-4">
            {Object.entries(notificationSettings.inAppNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-gray-700">
                  {key.split(/(?=[A-Z])/).join(" ")}
                </label>
                <button
                  onClick={() => handleToggle("inAppNotifications", key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    value ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      value ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Reminder Settings</h3>
          <div className="space-y-4">
            {Object.entries(notificationSettings.reminderSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-gray-700">
                  {key.split(/(?=[A-Z])/).join(" ")}
                </label>
                <button
                  onClick={() => handleToggle("reminderSettings", key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    value ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      value ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
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

export default NotificationSettings; 