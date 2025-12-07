import React, { useState, useEffect } from "react";
import { User, Settings } from "lucide-react";
import { getProfile, updateProfile } from "../lib/supabase";

interface ProfileData {
  full_name: string;
  phone: string;
  address: string;
  emergency_contact: string;
  medical_conditions: string[];
  is_profile_complete: boolean;
  email: string;
  role: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    phone: "",
    address: "",
    emergency_contact: "",
    medical_conditions: [],
    is_profile_complete: false,
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newCondition, setNewCondition] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile({
        full_name: data.full_name || "",
        phone: data.phone || "",
        address: data.address || "",
        emergency_contact: data.emergency_contact || "",
        medical_conditions: data.medical_conditions || [],
        is_profile_complete: data.is_profile_complete || false,
        email: data.email || "",
        role: data.role || "",
      });
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const requiredFilled =
        !!profile.full_name &&
        !!profile.phone &&
        !!profile.address &&
        !!profile.emergency_contact;

      const updated = await updateProfile({
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
        emergency_contact: profile.emergency_contact,
        medical_conditions: profile.medical_conditions,
        is_profile_complete: requiredFilled,
        role: profile.role,
      });
      setProfile({
        ...profile,
        is_profile_complete: updated.is_profile_complete,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setProfile({
        ...profile,
        medical_conditions: [
          ...profile.medical_conditions,
          newCondition.trim(),
        ],
      });
      setNewCondition("");
    }
  };

  const removeCondition = (index: number) => {
    setProfile({
      ...profile,
      medical_conditions: profile.medical_conditions.filter(
        (_, i) => i !== index
      ),
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <Settings className="h-8 w-8 text-rose-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Profile Settings
            </h1>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <p className="text-green-700">Profile updated successfully!</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-gray-600">{profile.email}</span>
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                {profile.role}
              </span>
              {profile.is_profile_complete && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Profile Complete
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                value={profile.address}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Emergency Contact
              </label>
              <input
                type="text"
                value={profile.emergency_contact}
                onChange={(e) =>
                  setProfile({ ...profile, emergency_contact: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                placeholder="Name and phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Medical Conditions
              </label>
              <div className="mt-1 flex space-x-2">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  placeholder="Add a medical condition"
                />
                <button
                  type="button"
                  onClick={addCondition}
                  className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {profile.medical_conditions.map((condition, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <span>{condition}</span>
                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              Save Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
