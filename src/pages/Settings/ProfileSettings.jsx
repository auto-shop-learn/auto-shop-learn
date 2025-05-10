import { useState, useEffect } from "react";
import { db, auth } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { toast } from "react-toastify";

const ProfileSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    department: "",
    position: "",
    phoneNumber: "",
    bio: "",
    profilePicture: null
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setProfileData({
              displayName: data.displayName || "",
              email: data.email || "",
              department: data.department || "",
              position: data.position || "",
              phoneNumber: data.phoneNumber || "",
              bio: data.bio || "",
              profilePicture: data.photoURL || null
            });
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        department: profileData.department,
        position: profileData.position,
        phoneNumber: profileData.phoneNumber,
        bio: profileData.bio,
        updatedAt: new Date()
      });

      // Update auth profile
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName,
        photoURL: profileData.profilePicture
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
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
      <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="displayName"
              value={profileData.displayName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              className="w-full p-2 border rounded bg-gray-50"
              disabled
            />
            <p className="text-sm text-gray-500 mt-1">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={profileData.department}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <input
              type="text"
              name="position"
              value={profileData.position}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={profileData.phoneNumber}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            name="bio"
            value={profileData.bio}
            onChange={handleInputChange}
            rows={4}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings; 