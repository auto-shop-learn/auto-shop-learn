import { useState, useEffect } from "react";
import { db, auth } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const Preferences = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    displayDensity: "comfortable",
    autoSave: true,
    defaultView: "dashboard"
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.preferences) {
              setPreferences(data.preferences);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
        toast.error("Failed to load preferences");
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        preferences,
        updatedAt: new Date()
      });

      toast.success("Preferences updated successfully");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
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
      <h2 className="text-xl font-bold mb-6">Preferences</h2>

      <div className="space-y-8">
        {/* Theme Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Appearance</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={preferences.theme}
                onChange={(e) => handleChange("theme", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Density
              </label>
              <select
                value={preferences.displayDensity}
                onChange={(e) => handleChange("displayDensity", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>
          </div>
        </div>

        {/* Language and Region */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Language and Region</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => handleChange("language", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {Intl.supportedValuesOf("timeZone").map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <select
                value={preferences.dateFormat}
                onChange={(e) => handleChange("dateFormat", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Format
              </label>
              <select
                value={preferences.timeFormat}
                onChange={(e) => handleChange("timeFormat", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="12h">12-hour</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default View
              </label>
              <select
                value={preferences.defaultView}
                onChange={(e) => handleChange("defaultView", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="dashboard">Dashboard</option>
                <option value="courses">Courses</option>
                <option value="quizzes">Quizzes</option>
                <option value="grades">Grades</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-700">Auto-save Changes</label>
              <button
                onClick={() => handleChange("autoSave", !preferences.autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  preferences.autoSave ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    preferences.autoSave ? "translate-x-6" : "translate-x-1"
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

export default Preferences; 